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
  <div v-if="states.isList && states.dashboardList.length" class="ds-name">
    <div>{{ t("dashboards") }}</div>
    <Selector
      :value="states.dashboardName"
      :options="states.dashboardList"
      size="small"
      placeholder="Please select a dashboard name"
      @change="changeDashboard"
      class="selectors"
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
        dashboardStore.selectedGrid.graph.type && !states.isList && index !== 0
      "
      @change="changeMetricType(index, $event)"
      class="selectors"
    />
    <span
      v-show="states.isList || states.metricTypes[0] === 'readMetricsValues'"
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
  ListChartTypes,
  MetricCatalog,
  DefaultGraphConfig,
  EntityType,
  ChartTypes,
  PodsChartTypes,
  ListEntity,
} from "../../data";
import { ElMessage } from "element-plus";
import Icon from "@/components/Icon.vue";
import { useQueryProcessor, useSourceProcessor } from "@/hooks/useProcessor";
import { useI18n } from "vue-i18n";
import { DashboardItem } from "@/types/dashboard";

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
  isList: boolean;
  metricList: (Option & { type: string })[];
  dashboardName: string;
  dashboardList: (DashboardItem & { label: string; value: string })[];
}>({
  metrics: metrics && metrics.length ? metrics : [""],
  metricTypes: metricTypes && metricTypes.length ? metricTypes : [""],
  metricTypeList: [],
  visTypes: [],
  isList: false,
  metricList: [],
  dashboardName: graph.dashboardName,
  dashboardList: [],
});

states.isList = ListChartTypes.includes(graph.type);
states.visTypes = setVisTypes();

setDashboards();
setMetricType();

async function setMetricType(catalog?: string) {
  const { graph } = dashboardStore.selectedGrid;
  if (states.isList) {
    catalog = catalog || ListEntity[graph.type];
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
      const index = states.metrics.findIndex((m: string) => m === d.value);
      if (index > -1) {
        return d;
      }
    }
  );

  if (metrics.length) {
    states.metrics = metrics.map((d: { value: string }) => d.value);
  } else {
    states.metrics = [""];
    states.metricTypes = [""];
  }
  dashboardStore.selectWidget({
    ...dashboardStore.selectedGrid,
    metrics,
    metricTypes,
  });
  for (const metric of metrics) {
    if (states.metrics.includes(metric)) {
      states.metricTypeList.push(MetricTypes[metric.type]);
    }
  }
  if (states.metrics && states.metrics[0]) {
    queryMetrics();
  } else {
    emit("update", {});
  }
}

function setDashboards() {
  const { graph } = dashboardStore.selectedGrid;
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  states.dashboardList = list.reduce(
    (
      prev: (DashboardItem & { label: string; value: string })[],
      d: DashboardItem
    ) => {
      if (d.layer === dashboardStore.layerId) {
        if (
          (d.entity === EntityType[0].value && graph.type === "ServiceList") ||
          (d.entity === EntityType[2].value && graph.type === "EndpointList") ||
          (d.entity === EntityType[3].value && graph.type === "InstanceList")
        ) {
          prev.push({
            ...d,
            value: d.name,
            label: d.name,
          });
        }
      }
      return prev;
    },
    []
  );
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
      (d: Option) => !ListChartTypes.includes(d.value)
    );
  }

  return graphs;
}

function changeChartType(item: Option) {
  const graph = DefaultGraphConfig[item.value];
  dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, graph });
  states.isList = ListChartTypes.includes(graph.type);
  if (states.isList) {
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
  setMetricType(catalog[graph.type]);
  setDashboards();
  states.dashboardName = "";
}

function changeMetrics(
  index: number,
  arr: (Option & { type: string })[] | any
) {
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
  if (states.isList) {
    return;
  }
  queryMetrics();
}

function changeMetricType(index: number, opt: Option[] | any) {
  const metric =
    states.metricList.filter(
      (d: Option) => states.metrics[index] === d.value
    )[0] || {};
  if (states.isList) {
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
  if (states.isList) {
    return;
  }
  queryMetrics();
}
async function queryMetrics() {
  const { standard } = dashboardStore.selectedGrid;
  const params = useQueryProcessor({ ...states, standard });
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
  const source = useSourceProcessor(json, { ...states, standard });
  emit("update", source);
}

function changeDashboard(opt: any) {
  states.dashboardName = opt[0].value;
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
  if (!states.isList) {
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
