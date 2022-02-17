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
    <el-input
      v-model="states.linkDashboard"
      placeholder="Please input a dashboard name for calls"
      @change="updateSettings"
      size="small"
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
    <span v-show="isServer">
      <div class="label">{{ t("nodeDashboard") }}</div>
      <div v-for="(item, index) in items" :key="index" class="metric-item">
        <Selector
          :value="item.scope"
          :options="ScopeType"
          size="small"
          placeholder="Select a scope"
          @change="changeScope(index, $event)"
          class="item mr-5"
        />
        <el-input
          v-model="item.dashboard"
          placeholder="Please input a dashboard name for nodes"
          @change="updateNodeDashboards(index, $event)"
          size="small"
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
    </span>
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
  <div class="legend-settings" v-show="isServer">
    <h5 class="title">{{ t("legendSettings") }}</h5>
    <div class="label">{{ t("metrics") }}</div>
    <Selector
      class="item mr-5"
      :value="legend.metric.name"
      :options="states.nodeMetricList"
      size="small"
      placeholder="Select a metric"
      @change="changeLegend(LegendOpt.NAME, $event)"
    />
    <Selector
      class="input-small mr-5"
      :value="legend.metric.condition"
      :options="MetricConditions"
      size="small"
      placeholder="Select a condition"
      @change="changeLegend(LegendOpt.CONDITION, $event)"
    />
    <el-input
      v-model="legend.metric.value"
      placeholder="Please input a value"
      @change="changeLegend(LegendOpt.VALUE, $event)"
      size="small"
      class="item"
    />
    <!-- <div class="label">{{ t("conditions") }}</div>
    <Selector
      class="inputs"
      :value="legend.condition"
      :options="LegendConditions"
      size="small"
      placeholder="Select a condition"
      @change="changeCondition"
    /> -->
    <!-- <div class="label">{{ t("metrics") }}</div>
    <Selector
      class="item mr-5"
      :value="legend.secondMetric.name"
      :options="states.nodeMetricList"
      size="small"
      placeholder="Select a metric"
      @change="changeLegendMetric(LegendOpt.NAME, $event)"
    />
    <Selector
      class="input-small mr-5"
      :value="legend.secondMetric.value"
      :options="states.nodeMetricList"
      size="small"
      placeholder="Select a metric"
      @change="changeLegendMetric(LegendOpt.CONDITION, $event)"
    />
    <el-input
      v-model="legend.secondMetric.condidtion"
      placeholder="Please input a value"
      @change="changeLegendMetric(LegendOpt.VALUE, $event)"
      size="small"
      class="item"
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
import { Node, Call } from "@/types/topology";
import { EntityType, LegendOpt } from "../../../data";

/*global defineEmits */
const emit = defineEmits(["update", "updateNodes"]);
const { t } = useI18n();
const dashboardStore = useDashboardStore();
const topologyStore = useTopologyStore();
const items = reactive<
  {
    scope: string;
    dashboard: string;
  }[]
>([{ scope: "", dashboard: "" }]);
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
}>({
  linkDashboard: "",
  nodeDashboard: [],
  linkServerMetrics: [],
  linkClientMetrics: [],
  nodeMetrics: [],
  nodeMetricList: [],
  linkMetricList: [],
});
const isServer = [EntityType[0].value, EntityType[1].value].includes(
  dashboardStore.entity
);
const legend = reactive<{
  metric: any;
  condition: string;
  secondMetric: any;
}>({ metric: {}, condition: "", secondMetric: {} });

getMetricList();
async function getMetricList() {
  const json = await dashboardStore.fetchMetricList();
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  const entity =
    dashboardStore.entity === EntityType[1].value
      ? EntityType[0].value
      : dashboardStore.entity;
  states.nodeMetricList = (json.data.metrics || []).filter(
    (d: { catalog: string }) => entity === (MetricCatalog as any)[d.catalog]
  );
  const e =
    dashboardStore.entity === EntityType[1].value
      ? EntityType[0].value
      : dashboardStore.entity === EntityType[4].value
      ? EntityType[3].value
      : dashboardStore.entity;
  states.linkMetricList = (json.data.metrics || []).filter(
    (d: { catalog: string }) =>
      e + "Relation" === (MetricCatalog as any)[d.catalog]
  );
}
async function setLegend() {
  if (!legend.metric.name) {
    return;
  }
  if (!legend.metric.value) {
    return;
  }
  if (!legend.metric.condition) {
    return;
  }

  updateSettings();
  const ids = topologyStore.nodes.map((d: Node) => d.id);
  const param = await useQueryTopologyMetrics([legend.metric.name], ids);
  const res = await topologyStore.getLegendMetrics(param);

  if (res.errors) {
    ElMessage.error(res.errors);
  }
  emit("updateNodes");
}
function changeLegend(type: string, opt: any) {
  legend.metric[type] = opt[0].value || opt;
}
// function changeCondition(opt: Option[]) {
//   legend.condition = opt[0].value;
// }
// function changeLegendMetric(type: string, opt: any) {
//   legend.secondMetric[type] = opt[0].value || opt;
// }
function changeScope(index: number, opt: Option[]) {
  items[index].scope = opt[0].value;
  items[index].dashboard = "";
}
function updateNodeDashboards(index: number, content: string) {
  items[index].dashboard = content;
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
  emit("update", {
    linkDashboard: states.linkDashboard,
    nodeDashboard: items.filter(
      (d: { scope: string; dashboard: string }) => d.dashboard
    ),
    linkServerMetrics: states.linkServerMetrics,
    linkClientMetrics: states.linkClientMetrics,
    nodeMetrics: states.nodeMetrics,
    legend,
  });
}
async function changeLinkServerMetrics(options: Option[]) {
  states.linkServerMetrics = options.map((d: Option) => d.value);
  updateSettings();
  if (!states.linkServerMetrics.length) {
    topologyStore.setLinkServerMetrics({});
    return;
  }
  const idsS = topologyStore.calls
    .filter((i: Call) => i.detectPoints.includes("SERVER"))
    .map((b: Call) => b.id);
  const param = await useQueryTopologyMetrics(states.linkServerMetrics, idsS);
  const res = await topologyStore.getCallServerMetrics(param);

  if (res.errors) {
    ElMessage.error(res.errors);
  }
}
async function changeLinkClientMetrics(options: Option[]) {
  states.linkClientMetrics = options.map((d: Option) => d.value);
  updateSettings();
  if (!states.linkClientMetrics.length) {
    topologyStore.setLinkClientMetrics({});
    return;
  }
  const idsC = topologyStore.calls
    .filter((i: Call) => i.detectPoints.includes("CLIENT"))
    .map((b: Call) => b.id);
  const param = await useQueryTopologyMetrics(states.linkClientMetrics, idsC);
  const res = await topologyStore.getCallClientMetrics(param);

  if (res.errors) {
    ElMessage.error(res.errors);
  }
}
async function changeNodeMetrics(options: Option[]) {
  states.nodeMetrics = options.map((d: Option) => d.value);
  updateSettings();
  if (!states.nodeMetrics.length) {
    topologyStore.setNodeMetrics({});
    return;
  }
  const ids = topologyStore.nodes.map((d: Node) => d.id);
  const param = await useQueryTopologyMetrics(states.nodeMetrics, ids);
  const res = await topologyStore.getNodeMetrics(param);

  if (res.errors) {
    ElMessage.error(res.errors);
  }
}
</script>
<style lang="scss" scoped>
.link-settings {
  margin-bottom: 20px;
}

.inputs {
  margin-top: 8px;
  width: 350px;
}

.item {
  width: 140px;
  margin-top: 5px;
}

.input-small {
  width: 45px;
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
</style>
