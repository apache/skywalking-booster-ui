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
    <div class="label">{{ t("nodeDashboard") }}</div>
    <div v-for="(item, index) in items" :key="index" class="metric-item">
      <Selector
        :value="item.scope"
        :options="ScopeType"
        size="small"
        placeholder="Select a scope"
        @change="changeScope(index, $event)"
        class="item"
      />
      <el-input
        v-model="item.dashboard"
        placeholder="Please input a dashboard name for nodes"
        @change="updateNodeDashboards(index, $event)"
        size="small"
        class="item"
      />
      <span>
        <Icon
          class="cp mr-5"
          v-show="index === items.length - 1 && items.length < 5"
          iconName="add_circle_outlinecontrol_point"
          size="middle"
          @click="addItem"
        />
        <Icon
          class="cp"
          v-show="items.length > 1"
          iconName="remove_circle_outline"
          size="middle"
          @click="deleteItem(index)"
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
</template>
<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useTopologyStore } from "@/store/modules/topology";
import { ElMessage } from "element-plus";
import { MetricCatalog, ScopeType } from "../../../data";
import { Option } from "@/types/app";
import { useQueryTopologyMetrics } from "@/hooks/useProcessor";
import { Node, Call } from "@/types/topology";
import { EntityType } from "../../../data";

/*global defineEmits */
const emit = defineEmits(["update"]);
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
  nodeDashboard: string;
  linkServerMetrics: string[];
  linkClientMetrics: string[];
  nodeMetrics: string[];
  nodeMetricList: Option[];
  linkMetricList: Option[];
}>({
  linkDashboard: "",
  nodeDashboard: "",
  linkServerMetrics: [],
  linkClientMetrics: [],
  nodeMetrics: [],
  nodeMetricList: [],
  linkMetricList: [],
});

getMetricList();
async function getMetricList() {
  const json = await dashboardStore.fetchMetricList();
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  states.nodeMetricList = (json.data.metrics || []).filter(
    (d: { catalog: string }) =>
      dashboardStore.entity === (MetricCatalog as any)[d.catalog]
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
  width: 330px;
}

.item {
  width: 137px;
  margin: 5px 5px 0 0;
}

.title {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  margin-top: 10px;
}
</style>
