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
    <div>{{ t("dashboards") }}</div>
    <el-input
      v-model="states.dashboardName"
      placeholder="Please input dashboard name"
      @change="changeDashboard"
      class="selectors"
      size="small"
    />
  </div>
  <div>{{ t("metrics") }}</div>
  <div
    v-for="(metric, index) in states.metrics"
    :key="index"
    class="metric-item"
  >
    <Selector
      :value="metric"
      :options="states.metricList"
      size="small"
      placeholder="Select a metric"
      @change="changeMetrics(index, $event)"
      class="selectors"
    />
    <Selector
      :value="states.metricTypes[index]"
      :options="states.metricTypeList[index]"
      size="small"
      :disabled="
        dashboardStore.selectedGrid.graph.type && !states.isTable && index !== 0
      "
      @change="changeMetricType(index, $event)"
      class="selectors"
    />
    <span
      v-show="states.isTable || states.metricTypes[0] === 'readMetricsValues'"
    >
      <Icon
        class="cp mr-5"
        v-show="
          index === states.metrics.length - 1 && states.metrics.length < 5
        "
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
    </span>
  </div>
  <div>{{ t("visualization") }}</div>
  <div class="chart-types">
    <span
      v-for="(type, index) in states.visTypes"
      :key="index"
      @click="changeChartType(type)"
      :class="{
        active: type.value === dashboardStore.selectedGrid.graph.type,
      }"
    >
      {{ type.label }}
    </span>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { Option } from "@/types/app";
import { useDashboardStore } from "@/store/modules/dashboard";
import {
  MetricTypes,
  TableChartTypes,
  MetricCatalog,
  DefaultGraphConfig,
  EntityType,
  ChartTypes,
  PodsChartTypes,
  TableEntity,
} from "../data";
import { ElMessage } from "element-plus";
import Icon from "@/components/Icon.vue";
import { useQueryProcessor, useSourceProcessor } from "@/hooks/useProcessor";
import { useI18n } from "vue-i18n";

/*global defineEmits */
const { t } = useI18n();
const emit = defineEmits(["update", "loading"]);
const dashboardStore = useDashboardStore();
const { metrics, metricTypes, graph } = dashboardStore.selectedGrid;
const states = reactive<{
  metrics: string[];
  metricTypes: string[];
  metricTypeList: Option[][];
  visTypes: Option[];
  isTable: boolean;
  metricList: (Option & { type: string })[];
  dashboardName: string;
}>({
  metrics: metrics && metrics.length ? metrics : [""],
  metricTypes: metricTypes && metricTypes.length ? metricTypes : [""],
  metricTypeList: [],
  visTypes: [],
  isTable: false,
  metricList: [],
  dashboardName: graph.dashboardName,
});

states.isTable = TableChartTypes.includes(graph.type);
states.visTypes = setVisTypes();
setMetricType();

async function setMetricType(catalog?: string) {
  if (states.isTable) {
    catalog = catalog || TableEntity[graph.type];
  } else {
    catalog = catalog || dashboardStore.entity;
  }
  const json = await dashboardStore.fetchMetricList();
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  states.metricList = (json.data.metrics || []).filter(
    (d: { catalog: string }) => catalog === (MetricCatalog as any)[d.catalog]
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
  if (states.metrics && states.metrics[0]) {
    queryMetrics();
  }
}

function setVisTypes() {
  let graphs = [];
  if (dashboardStore.entity === EntityType[0].value) {
    graphs = ChartTypes.filter((d: Option) => d.value !== ChartTypes[7].value);
  } else if (dashboardStore.entity === EntityType[1].value) {
    graphs = ChartTypes.filter(
      (d: Option) => !PodsChartTypes.includes(d.value)
    );
  } else {
    graphs = ChartTypes.filter(
      (d: Option) => !TableChartTypes.includes(d.value)
    );
  }

  return graphs;
}

function changeChartType(item: Option) {
  const graph = DefaultGraphConfig[item.value];
  states.isTable = TableChartTypes.includes(graph.type);
  dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, graph });
  states.isTable = TableChartTypes.includes(graph.type);
  if (states.isTable) {
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      metrics: [""],
      metricTypes: [""],
    });
    states.metrics = [""];
    states.metricTypes = [""];
  }
  const catalog: { [key: string]: string } = {
    InstanceList: EntityType[3].value,
    EndpointList: EntityType[2].value,
    ServiceList: EntityType[0].value,
  };
  if (catalog[graph.type]) {
    setMetricType(catalog[graph.type]);
  }
}

function changeMetrics(index: number, arr: (Option & { type: string })[]) {
  if (!arr.length) {
    states.metricTypeList = [];
    states.metricTypes = [];
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      ...{ metricTypes: states.metricTypes, metrics: states.metrics },
    });
    return;
  }
  states.metrics[index] = arr[0].value;
  const typeOfMetrics = arr[0].type;

  states.metricTypeList[index] = MetricTypes[typeOfMetrics];
  states.metricTypes[index] = MetricTypes[typeOfMetrics][0].value;
  dashboardStore.selectWidget({
    ...dashboardStore.selectedGrid,
    ...{ metricTypes: states.metricTypes, metrics: states.metrics },
  });
  if (states.isTable) {
    return;
  }
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
  dashboardStore.selectWidget({
    ...dashboardStore.selectedGrid,
    ...{ metricTypes: states.metricTypes },
  });
  if (states.isTable) {
    return;
  }
  queryMetrics();
}
async function queryMetrics() {
  const params = useQueryProcessor(states);
  if (!params) {
    emit("update", {});
    return;
  }

  emit("loading", true);
  const json = await dashboardStore.fetchMetricValue(params);
  emit("loading", false);
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  const source = useSourceProcessor(json, states);
  emit("update", source);
}

function changeDashboard() {
  const graph = {
    ...dashboardStore.selectedGrid.graph,
    dashboardName: states.dashboardName,
  };
  dashboardStore.selectWidget({
    ...dashboardStore.selectedGrid,
    graph,
  });
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
  background-color: #409eff;
  color: #fff;
}
</style>
