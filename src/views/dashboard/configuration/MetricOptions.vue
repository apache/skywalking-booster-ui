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
  <div
    v-for="(metric, index) in states.metrics"
    :key="index"
    class="metric-item"
  >
    <Selector
      :value="metric"
      :options="states.metricList"
      size="mini"
      placeholder="Select a metric"
      @change="changeMetrics(index, $event)"
      class="selectors"
    />
    <Selector
      :value="states.metricTypes[index]"
      :options="states.metricTypeList[index]"
      size="mini"
      :disabled="states.graph.type && !states.isTable && index !== 0"
      @change="changeMetricType(index, $event)"
      class="selectors"
    />
    <Icon
      class="cp mr-5"
      v-show="index === states.metrics.length - 1 && index < 6"
      iconName="add_circle_outlinecontrol_point"
      size="middle"
      @click="addMetric"
    />
    <Icon
      class="cp"
      v-show="states.metrics.length > 1"
      iconName="remove_circle_outline"
      size="middle"
      @click="deleteMetric(index)"
    />
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import type { PropType } from "vue";
import { useRoute } from "vue-router";
import { Option } from "@/types/app";
import { GraphConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import { MetricTypes, TableChartTypes } from "../data";
import { ElMessage } from "element-plus";
import Icon from "@/components/Icon.vue";

/*global defineProps, defineEmits */
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
  metricTypeList: Option[][];
  visType: Option[];
  isTable: boolean;
  metricList: (Option & { type: string })[];
  graph: GraphConfig | any;
}>({
  metrics: selectedGrid.metrics || [""],
  metricTypes: selectedGrid.metricTypes || [""],
  metricTypeList: [],
  visType: [],
  isTable: false,
  metricList: [],
  graph: props.graph,
});
states.isTable = TableChartTypes.includes(states.graph.type);

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
  const metrics: any = states.metricList.filter(
    (d: { value: string; type: string }) => {
      const metric = states.metrics.filter((m: string) => m === d.value)[0];
      if (metric) {
        return d;
      }
    }
  );
  for (const metric of metrics) {
    states.metricTypeList.push(MetricTypes[metric.type]);
  }

  queryMetrics();
}

function changeMetrics(index: number, arr: (Option & { type: string })[]) {
  if (!arr.length) {
    states.metricTypeList = [];
    states.metricTypes = [];
    emit("apply", { metricTypes: states.metricTypes });
    return;
  }
  states.metrics[index] = arr[0].value;
  const typeOfMetrics = arr[0].type;
  states.metricTypeList[index] = MetricTypes[typeOfMetrics];
  states.metricTypes[index] = MetricTypes[typeOfMetrics][0].value;
  emit("apply", { metricTypes: states.metricTypes, metrics: states.metrics });
  queryMetrics();
}

function changeMetricType(index: number, opt: Option[]) {
  const metric =
    states.metricList.filter(
      (d: Option) => states.metrics[index] === d.value
    )[0] || {};
  if (states.isTable) {
    states.metricTypes[index] = opt[0].value;
    states.metricTypeList[index] = (MetricTypes as any)[metric.type];
  } else {
    states.metricTypes = states.metricTypes.map((d: string) => {
      d = opt[0].value;
      return d;
    });
    states.metricTypeList = states.metricTypeList.map((d: Option[]) => {
      d = (MetricTypes as any)[metric.type];

      return d;
    });
  }
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
function addMetric() {
  states.metrics.push("");
  if (!states.isTable) {
    states.metricTypes.push(states.metricTypes[0]);
    states.metricTypeList.push(states.metricTypeList[0]);
    return;
  }
  states.metricTypes.push("");
}
function deleteMetric(index: number) {
  states.metrics.splice(index, 1);
  states.metricTypes.splice(index, 1);
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

.metric-item {
  margin-bottom: 10px;
}
</style>
