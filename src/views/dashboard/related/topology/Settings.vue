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
    <div class="label">{{ t("linkMetrics") }}</div>
    <Selector
      class="inputs"
      :multiple="true"
      :value="states.linkMetrics"
      :options="states.linkMetricList"
      size="small"
      placeholder="Select metrics"
      @change="changeLinkMetrics"
    />
  </div>
  <div class="node-settings">
    <h5 class="title">{{ t("nodeSettings") }}</h5>
    <div class="label">{{ t("nodeDashboard") }}</div>
    <el-input
      v-model="states.nodeDashboard"
      placeholder="Please input a dashboard name for nodes"
      @change="updateSettings"
      size="small"
      class="inputs"
    />
    <div class="label">{{ t("instanceDashboard") }}</div>
    <el-input
      v-model="states.instanceDashboard"
      placeholder="Please input a dashboard name for service instances"
      @change="updateSettings"
      size="small"
      class="inputs"
    />
    <div class="label">{{ t("endpointDashboard") }}</div>
    <el-input
      v-model="states.endpointDashboard"
      placeholder="Please input a dashboard name for endpoints"
      @change="updateSettings"
      size="small"
      class="inputs"
    />
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
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import { ElMessage } from "element-plus";
import { MetricCatalog } from "../../data";
import { Option } from "@/types/app";

/*global defineEmits */
const emit = defineEmits(["update"]);
const { t } = useI18n();
const dashboardStore = useDashboardStore();
const states = reactive<{
  linkDashboard: string;
  nodeDashboard: string;
  instanceDashboard: string;
  endpointDashboard: string;
  linkMetrics: string[];
  nodeMetrics: string[];
  nodeMetricList: Option[];
  linkMetricList: Option[];
}>({
  linkDashboard: "",
  nodeDashboard: "",
  instanceDashboard: "",
  endpointDashboard: "",
  linkMetrics: [],
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
  states.linkMetricList = (json.data.metrics || []).filter(
    (d: { catalog: string }) =>
      dashboardStore.entity + "Relation" === (MetricCatalog as any)[d.catalog]
  );
}
function updateSettings() {
  emit("update", {
    linkDashboard: states.linkDashboard,
    nodeDashboard: states.nodeDashboard,
    endpointDashboard: states.endpointDashboard,
    instanceDashboard: states.instanceDashboard,
    linkMetrics: states.linkMetrics,
    nodeMetrics: states.nodeMetrics,
  });
}
function changeLinkMetrics(options: Option[]) {
  states.linkMetrics = options.map((d: Option) => d.value);
  updateSettings();
}
function changeNodeMetrics(options: Option[]) {
  states.nodeMetrics = options.map((d: Option) => d.value);
  updateSettings();
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

.title {
  margin-bottom: 0;
}

.label {
  font-size: 12px;
  margin-top: 10px;
}
</style>
