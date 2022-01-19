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
  <div v-show="states.isTable" class="ds-name">
    <Selector
      :value="states.graph.dashboardName"
      :options="states.metricList"
      size="mini"
      placeholder="Select a dashboard"
      @change="changeDashboard"
      class="selectors"
    />
  </div>
  <div>
    <Selector
      :value="states.metrics"
      :options="states.metricList"
      :multiple="true"
      size="mini"
      placeholder="Select a metric"
      @change="changeMetrics"
      class="selectors"
    />
    <Selector
      :value="states.metricTypes"
      :options="states.metricTypeList"
      size="mini"
      @change="changeMetricType"
      class="selectors"
      :multiple="true"
    />
  </div>
</template>
<script lang="ts" setup>
import { reactive, defineProps, defineEmits } from "vue";
import type { PropType } from "vue";
import { useRoute } from "vue-router";
import { Option } from "@/types/app";
import { GraphConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import { MetricTypes, MetricQueryTypes, TableChartTypes } from "../data";
import { ElMessage } from "element-plus";

const props = defineProps({
  graph: {
    type: Object as PropType<GraphConfig>,
    default: () => ({}),
  },
});
const emit = defineEmits(["update", "apply"]);
const dashboardStore = useDashboardStore();
const { selectedGrid } = dashboardStore;
const states = reactive<{
  metrics: string[];
  metricTypes: string[];
  metricTypeList: Option[];
  metricQueryType: string;
  visType: Option[];
  isTable: boolean;
  metricList: (Option & { type: string })[];
  graph: GraphConfig | any;
}>({
  metrics: selectedGrid.metrics || [],
  metricTypes: selectedGrid.metricTypes || [],
  metricTypeList: [],
  metricQueryType: "",
  visType: [],
  isTable: false,
  metricList: [],
  graph: props.graph,
});
states.isTable = TableChartTypes.includes(states.graph.type || "");
const params = useRoute().params;
setMetricType();
async function setMetricType() {
  const json = await dashboardStore.fetchMetricList();
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  states.metricList = (json.data.metrics || []).filter(
    (d: { catalog: string }) =>
      String(params.entity).toUpperCase() === d.catalog
  );
  const name = states.metrics[0];
  if (!name) {
    return;
  }
  const metrics: any = states.metricList.filter(
    (d: { value: string }) => d.value === name
  )[0];
  states.metricTypeList = MetricTypes[metrics.type];
  states.metricTypes = [MetricTypes[metrics.type][0].value];
  emit("apply", { metricTypes: states.metricTypes });
  queryMetrics();
}
function changeMetrics(arr: (Option & { type: string })[]) {
  if (!arr.length) {
    states.metricTypeList = [];
    states.metricTypes = [];
    emit("apply", { metricTypes: states.metricTypes });
    return;
  }
  states.metrics = arr.map((d: Option) => d.value);
  if (arr[0]) {
    const typeOfMetrics = arr[0].type;
    states.metricTypeList = MetricTypes[typeOfMetrics];
    states.metricTypes = [MetricTypes[typeOfMetrics][0].value];
    emit("apply", { metricTypes: states.metricTypes, metrics: states.metrics });
    queryMetrics();
  }
}

function changeMetricType(val: Option[]) {
  states.metricTypes = [val[0].value];
  states.metricQueryType = (MetricQueryTypes as any)[states.metricTypes[0]];
  emit("apply", { metricTypes: states.metricTypes });
  queryMetrics();
}
async function queryMetrics() {
  const json = await dashboardStore.fetchMetricValue(
    dashboardStore.selectedGrid
  );
  if (!json) {
    return;
  }

  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  const metricVal = json.data.readMetricsValues.values.values.map(
    (d: { value: number }) => d.value
  );
  const m = states.metrics[0];
  if (!m) {
    return;
  }
  emit("update", { [m]: metricVal });
}
function changeDashboard(item: Option[]) {
  states.graph.dashboardName = item[0].value;
}
</script>
<style lang="scss" scoped>
.ds-name {
  margin-bottom: 10px;
}

.selectors {
  width: 500px;
  margin-right: 10px;
}
</style>
