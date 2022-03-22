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
  <div class="link-settings">
    <h5 class="title">{{ t("callSettings") }}</h5>
    <div class="label">{{ t("linkDashboard") }}</div>
    <Selector
      :value="states.linkDashboard"
      :options="states.linkDashboards"
      size="small"
      placeholder="Please input a dashboard name for calls"
      @change="changeLinkDashboard"
      class="inputs"
    />
    <div class="label">{{ t("linkServerMetrics") }}</div>
    <Selector
      class="inputs"
      :multiple="true"
      :value="states.linkServerMetrics"
      :options="states.linkMetricList"
      size="small"
      placeholder="Select metrics"
      @change="changeLinkServerMetrics"
    />
    <span v-show="dashboardStore.entity !== EntityType[2].value">
      <div class="label">
        {{ t("linkClientMetrics") }}
      </div>
      <Selector
        class="inputs"
        :multiple="true"
        :value="states.linkClientMetrics"
        :options="states.linkMetricList"
        size="small"
        placeholder="Select metrics"
        @change="changeLinkClientMetrics"
      />
    </span>
  </div>
  <div class="node-settings">
    <h5 class="title">{{ t("nodeSettings") }}</h5>
    <div class="label">{{ t("nodeDashboard") }}</div>
    <Selector
      v-show="!isService"
      :value="states.nodeDashboard"
      :options="states.nodeDashboards"
      size="small"
      placeholder="Please input a dashboard name for nodes"
      @change="changeNodeDashboard"
      class="inputs"
    />
    <div
      v-show="isService"
      v-for="(item, index) in items"
      :key="index"
      class="metric-item"
    >
      <Selector
        :value="item.scope"
        :options="ScopeType"
        size="small"
        placeholder="Select a scope"
        @change="changeScope(index, $event)"
        class="item mr-5"
      />
      <Selector
        :value="item.dashboard"
        :options="states.nodeDashboards"
        size="small"
        placeholder="Please input a dashboard name for nodes"
        @change="updateNodeDashboards(index, $event)"
        class="item mr-5"
      />
      <span>
        <Icon
          class="cp mr-5"
          v-show="items.length > 1"
          iconName="remove_circle_outline"
          size="middle"
          @click="deleteItem(index)"
        />
        <Icon
          class="cp"
          v-show="index === items.length - 1 && items.length < 5"
          iconName="add_circle_outlinecontrol_point"
          size="middle"
          @click="addItem"
        />
      </span>
    </div>
    <div class="label">{{ t("nodeMetrics") }}</div>
    <Selector
      class="inputs"
      :multiple="true"
      :value="states.nodeMetrics"
      :options="states.nodeMetricList"
      size="small"
      placeholder="Select metrics"
      @change="changeNodeMetrics"
    />
  </div>
  <div class="legend-settings" v-show="isService">
    <h5 class="title">{{ t("legendSettings") }}</h5>
    <div class="label">{{ t("conditions") }}</div>
    <div v-for="(metric, index) of legend.metric" :key="metric.name + index">
      <Selector
        class="item"
        :value="metric.name"
        :options="states.nodeMetricList"
        size="small"
        placeholder="Select a metric"
        @change="changeLegend(LegendOpt.NAME, $event, index)"
      />
      <Selector
        class="input-small"
        :value="metric.condition"
        :options="MetricConditions"
        size="small"
        placeholder="Select a condition"
        @change="changeLegend(LegendOpt.CONDITION, $event, index)"
      />
      <el-input
        v-model="metric.value"
        placeholder="Please input a value"
        @change="changeLegend(LegendOpt.VALUE, $event, index)"
        size="small"
        class="item"
      />
      <span>
        <Icon
          class="cp delete"
          iconName="remove_circle_outline"
          size="middle"
          @click="deleteMetric(index)"
          v-show="legend.metric.length > 1"
        />
        <Icon
          class="cp"
          iconName="add_circle_outlinecontrol_point"
          size="middle"
          v-show="
            index === legend.metric.length - 1 && legend.metric.length < 5
          "
          @click="addMetric"
        />
      </span>
      <div v-show="index !== legend.metric.length - 1">&&</div>
    </div>
    <!-- <div class="label">{{ t("conditions") }}</div>
    <Selector
      class="inputs"
      :value="legend.condition"
      :options="LegendConditions"
      size="small"
      placeholder="Select a condition"
      @change="changeCondition"
    /> -->
    <el-button
      @click="setLegend"
      class="legend-btn"
      size="small"
      type="primary"
    >
      {{ t("setLegend") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useTopologyStore } from "@/store/modules/topology";
import { ElMessage } from "element-plus";
import { MetricCatalog, ScopeType, MetricConditions } from "../../../data";
import { Option } from "@/types/app";
import { useQueryTopologyMetrics } from "@/hooks/useProcessor";
import { Node } from "@/types/topology";
import { DashboardItem } from "@/types/dashboard";
import { EntityType, LegendOpt, MetricsType } from "../../../data";

/*global defineEmits */
const emit = defineEmits(["update", "updateNodes"]);
const { t } = useI18n();
const dashboardStore = useDashboardStore();
const topologyStore = useTopologyStore();
const { selectedGrid } = dashboardStore;
const isService = [EntityType[0].value, EntityType[1].value].includes(
  dashboardStore.entity
);
const items = reactive<
  {
    scope: string;
    dashboard: string;
  }[]
>((isService && selectedGrid.nodeDashboard) || [{ scope: "", dashboard: "" }]);
const states = reactive<{
  linkDashboard: string;
  nodeDashboard: {
    scope: string;
    dashboard: string;
  }[];
  linkServerMetrics: string[];
  linkClientMetrics: string[];
  nodeMetrics: string[];
  nodeMetricList: Option[];
  linkMetricList: Option[];
  linkDashboards: (DashboardItem & { label: string; value: string })[];
  nodeDashboards: (DashboardItem & { label: string; value: string })[];
}>({
  linkDashboard: selectedGrid.linkDashboard || "",
  nodeDashboard: selectedGrid.nodeDashboard || [],
  linkServerMetrics: selectedGrid.linkServerMetrics || [],
  linkClientMetrics: selectedGrid.linkClientMetrics || [],
  nodeMetrics: selectedGrid.nodeMetrics || [],
  nodeMetricList: [],
  linkMetricList: [],
  linkDashboards: [],
  nodeDashboards: [],
});
const legend = reactive<{
  metric: { name: string; condition: string; value: string }[];
}>({ metric: selectedGrid.legend || [{ name: "", condition: "", value: "" }] });

getMetricList();
async function getMetricList() {
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  const json = await dashboardStore.fetchMetricList();
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  const entity =
    dashboardStore.entity === EntityType[1].value
      ? EntityType[0].value
      : dashboardStore.entity === EntityType[4].value
      ? EntityType[3].value
      : dashboardStore.entity;
  states.linkDashboards = list.reduce(
    (
      prev: (DashboardItem & { label: string; value: string })[],
      d: DashboardItem
    ) => {
      if (
        d.layer === dashboardStore.layerId &&
        d.entity === entity + "Relation"
      ) {
        prev.push({ ...d, label: d.name, value: d.name });
      }
      return prev;
    },
    []
  );
  states.nodeMetricList = (json.data.metrics || []).filter(
    (d: { type: string }) => d.type === MetricsType.REGULAR_VALUE
  );
  states.linkMetricList = (json.data.metrics || []).filter(
    (d: { catalog: string; type: string }) =>
      entity + "Relation" === (MetricCatalog as any)[d.catalog] &&
      d.type === MetricsType.REGULAR_VALUE
  );
  if (isService) {
    return;
  }
  states.nodeDashboards = list.reduce(
    (
      prev: (DashboardItem & { label: string; value: string })[],
      d: DashboardItem
    ) => {
      if (d.layer === dashboardStore.layerId && d.entity === entity) {
        prev.push({ ...d, label: d.name, value: d.name });
      }
      return prev;
    },
    []
  );
}
async function setLegend() {
  updateSettings();
  const ids = topologyStore.nodes.map((d: Node) => d.id);
  const names = dashboardStore.selectedGrid.legend.map((d: any) => d.name);
  const param = await useQueryTopologyMetrics(names, ids);
  const res = await topologyStore.getLegendMetrics(param);

  if (res.errors) {
    ElMessage.error(res.errors);
  }
  emit("updateNodes");
}
function changeNodeDashboard(opt: any) {
  states.nodeDashboard = opt[0].value;
  updateSettings();
}
function changeLinkDashboard(opt: any) {
  states.linkDashboard = opt[0].value;
  updateSettings();
}
function changeLegend(type: string, opt: any, index: number) {
  (legend.metric[index] as any)[type] = opt[0].value || opt;
}
function changeScope(index: number, opt: Option[] | any) {
  items[index].scope = opt[0].value;
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  states.nodeDashboards = list.reduce(
    (
      prev: (DashboardItem & { label: string; value: string })[],
      d: DashboardItem
    ) => {
      if (d.layer === dashboardStore.layerId && d.entity === opt[0].value) {
        prev.push({ ...d, label: d.name, value: d.name });
      }
      return prev;
    },
    []
  );
  items[index].dashboard = states.nodeDashboards[0].value;
}
function updateNodeDashboards(index: number, content: Option[] | any) {
  items[index].dashboard = content[0].value;
  updateSettings();
}
function addItem() {
  items.push({ scope: "", dashboard: "" });
}
function deleteItem(index: number) {
  items.splice(index, 1);
  updateSettings();
}
function updateSettings() {
  const metrics = legend.metric.filter(
    (d: any) => d.name && d.value && d.condition
  );
  const param = {
    linkDashboard: states.linkDashboard,
    nodeDashboard: isService
      ? items.filter((d: { scope: string; dashboard: string }) => d.dashboard)
      : states.nodeDashboard,
    linkServerMetrics: states.linkServerMetrics,
    linkClientMetrics: states.linkClientMetrics,
    nodeMetrics: states.nodeMetrics,
    legend: metrics,
  };
  dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, ...param });
  dashboardStore.setConfigs({ ...dashboardStore.selectedGrid, ...param });
  emit("update", param);
}
async function changeLinkServerMetrics(options: Option[] | any) {
  states.linkServerMetrics = options.map((d: Option) => d.value);
  updateSettings();
  if (!states.linkServerMetrics.length) {
    topologyStore.setLinkServerMetrics({});
    return;
  }
  topologyStore.getLinkServerMetrics(states.linkServerMetrics);
}
async function changeLinkClientMetrics(options: Option[] | any) {
  states.linkClientMetrics = options.map((d: Option) => d.value);
  updateSettings();
  if (!states.linkClientMetrics.length) {
    topologyStore.setLinkClientMetrics({});
    return;
  }
  topologyStore.getLinkClientMetrics(states.linkClientMetrics);
}
async function changeNodeMetrics(options: Option[] | any) {
  states.nodeMetrics = options.map((d: Option) => d.value);
  updateSettings();
  if (!states.nodeMetrics.length) {
    topologyStore.setNodeMetricValue({});
    return;
  }
  topologyStore.queryNodeMetrics(states.nodeMetrics);
}
function deleteMetric(index: number) {
  legend.metric.splice(index, 1);
}
function addMetric() {
  legend.metric.push({ name: "", condition: "", value: "" });
}
function saveConfig() {
  console.log(dashboardStore.selectedGrid);
  dashboardStore.setConfigs(dashboardStore.selectedGrid);
}
</script>
<style lang="scss" scoped>
.link-settings {
  margin-bottom: 20px;
}

.inputs {
  margin-top: 8px;
  width: 370px;
}

.item {
  width: 130px;
  margin-top: 5px;
}

.input-small {
  width: 45px;
  margin: 0 3px;
}

.title {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  margin-top: 10px;
}

.legend-btn {
  margin: 20px 0;
  cursor: pointer;
}

.delete {
  margin: 0 3px;
}
</style>
