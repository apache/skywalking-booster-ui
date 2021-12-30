<!-- Licensed to the Apache Software Foundation (ASF) under one or more
contributor license agreements.  See the NOTICE file distributed with
this work for additional information regarding copyright ownership.
The ASF licenses this file to You under the Apache License, Version 2.0
(the "License"); you may not use this file except in compliance with
the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. -->
<template>
  <div class="graph">No Data</div>
  <div class="config">
    <div class="metrics item">
      <label>Graph your metric</label>
      <div class="name">Metrics Name</div>
      <Selector
        :value="states.metrics"
        :options="metricOpts"
        :multiple="true"
        size="mini"
        placeholder="Select a metric"
        @change="changeMetrics"
        class="selectors"
      />
      <Selector
        v-show="states.valueType"
        :value="states.valueType"
        :options="states.valueTypes"
        size="mini"
        placeholder="Select a metric"
        @change="changeValueType"
        class="selectors"
      />
    </div>
    <div class="visualization item">
      <label>Select you visualization</label>
      <div class="chart-types">
        <span
          v-for="type in ChartTypes"
          :key="type.value"
          @click="changeChartType(type)"
          :class="{ active: type.value === states.chartType }"
        >
          {{ type.label }}
        </span>
      </div>
    </div>
    <div class="graph-styles item">
      <label>Graph styles</label>
    </div>
    <div class="item">
      <label>Widget options</label>
    </div>
    <div class="item">
      <label>Standard options</label>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import { ElMessage } from "element-plus";
import { ValuesTypes, MetricQueryTypes, ChartTypes } from "../data";
import { Option } from "@/types/app";
import Loading from "@/utils/loading";

const states = reactive<{
  metrics: string;
  valueTypes: Option[];
  valueType: string;
  metricQueryType: string;
  chartType: string;
}>({
  metrics: "",
  valueTypes: [],
  valueType: "",
  metricQueryType: "",
  chartType: "",
});
const { t } = useI18n();
const dashboardStore = useDashboardStore();
const { loading } = Loading();
async function changeMetrics(val: Option[]) {
  if (!val.length) {
    states.valueTypes = [];
    states.valueType = "";
    return;
  }
  const loadingInstance = loading({ text: t("loading"), fullscreen: true });
  const resp = await dashboardStore.fetchMetricType(val[0].value);
  loadingInstance.close();
  if (resp.error) {
    ElMessage.error(resp.data.error);
    return;
  }
  const { typeOfMetrics } = resp.data;
  states.valueTypes = ValuesTypes[typeOfMetrics];
  states.valueType = ValuesTypes[typeOfMetrics][0].value;
}
function changeValueType(val: Option[]) {
  states.valueType = String(val[0].value);
  states.metricQueryType = (MetricQueryTypes as any)[states.valueType];
}
function changeChartType(item: Option) {
  states.chartType = String(item.value);
}
const metricOpts = [
  { value: "service_apdex", label: "service_apdex" },
  { value: "service_sla", label: "service_sla" },
  { value: "service_cpm", label: "service_cpm" },
  { value: "service_resp_time", label: "service_resp_time" },
  { value: "service_percentile", label: "service_percentile" },
  { value: "service_mq_consume_latency", label: "service_mq_consume_latency" },
  { value: "service_mq_consume_count", label: "service_mq_consume_count" },
];
</script>
<style lang="scss" scoped>
.item {
  margin: 20px 0;
}

.graph {
  width: 100%;
  height: 350px;
  min-width: 1280px;
}

label {
  display: inline-block;
  font-weight: bold;
  margin-bottom: 10px;
}

.selectors {
  width: 500px;
  margin-right: 10px;
}

.name {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}

.config {
  min-width: 1280px;
}

.chart-types {
  span {
    display: inline-block;
    padding: 5px 10px;
    border: 1px solid #ccc;
    background-color: #fff;
    border-right: 0;
    cursor: pointer;
  }

  span:nth-last-child(1) {
    border-right: 1px solid #ccc;
  }
}

span.active {
  background-color: #eee;
}
</style>
