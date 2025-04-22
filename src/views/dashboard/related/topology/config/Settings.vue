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
  <div class="mb-20">
    <h5 class="title">{{ t("callSettings") }}</h5>
    <div class="label">{{ t("linkDashboard") }}</div>
    <Selector
      :value="states.linkDashboard"
      :options="states.linkDashboards"
      size="small"
      placeholder="Please input a dashboard name for calls"
      @change="changeLinkDashboard"
      class="inputs"
      :clearable="true"
    />
    <div class="label">
      <span>{{ t("linkServerMetrics") }}</span>
      <el-popover placement="left" :width="400" trigger="click" v-if="states.linkServerExpressions.length">
        <template #reference>
          <span @click="setConfigType('linkServerMetricConfig')">
            <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
          </span>
        </template>
        <Metrics :type="configType" @update="updateSettings" />
      </el-popover>
    </div>
    <div>
      <Tags
        :tags="states.linkServerExpressions"
        :vertical="true"
        :text="t('addExpressions')"
        @change="(param: string[]) => changeLinkServerExpressions(param)"
      />
    </div>
    <span v-show="dashboardStore.entity !== EntityType[2].value">
      <div class="label">
        <span>{{ t("linkClientMetrics") }}</span>
        <el-popover placement="left" :width="400" trigger="click" v-if="states.linkClientExpressions.length">
          <template #reference>
            <span @click="setConfigType('linkClientMetricConfig')">
              <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
            </span>
          </template>
          <Metrics :type="configType" @update="updateSettings" />
        </el-popover>
      </div>
      <div>
        <Tags
          :tags="states.linkClientExpressions"
          :vertical="true"
          :text="t('addExpressions')"
          @change="(param: string[]) => changeLinkClientExpressions(param)"
        />
      </div>
    </span>
  </div>
  <div>
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
    <div v-show="isService" v-for="(item, index) in items" :key="index" class="metric-item">
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
        <Icon class="cp mr-5" iconName="remove_circle_outline" size="middle" @click="deleteItem(index)" />
        <Icon
          class="cp"
          v-show="index === items.length - 1 && items.length < 5"
          iconName="add_circle_outlinecontrol_point"
          size="middle"
          @click="addItem"
        />
      </span>
    </div>
    <div class="label">
      <span>{{ t("nodeMetrics") }}</span>
      <el-popover placement="left" :width="400" trigger="click" v-if="states.nodeExpressions.length">
        <template #reference>
          <span @click="setConfigType('nodeMetricConfig')">
            <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
          </span>
        </template>
        <Metrics :type="configType" @update="updateSettings" />
      </el-popover>
    </div>
    <div>
      <Tags
        :tags="states.nodeExpressions"
        :vertical="true"
        :text="t('addExpressions')"
        @change="(param: string[]) => changeNodeExpressions(param)"
      />
    </div>
  </div>
  <div v-show="isService">
    <h5 class="title">{{ t("legendSettings") }}</h5>
    <span>
      <div class="label">Healthy Description</div>
      <el-input v-model="description.healthy" placeholder="Please input description" size="small" class="mt-5" />
    </span>
    <div class="label">
      <span>{{ t("unhealthyExpression") }}</span>
      <el-tooltip
        class="cp"
        content="The node would be red to indicate unhealthy status when the expression return greater than 0"
      >
        <span>
          <Icon class="icon-help ml-5" iconName="help" size="small" />
        </span>
      </el-tooltip>
    </div>
    <div>
      <el-input v-model="legendMQE.expression" placeholder="Please input a expression" size="small" class="inputs" />
    </div>
    <div class="label">Unhealthy Description</div>
    <el-input v-model="description.unhealthy" placeholder="Please input description" size="small" class="mt-5" />
    <el-button @click="setLegend" class="mt-20 mb-20" size="small" type="primary">
      {{ t("setLegend") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useTopologyStore } from "@/store/modules/topology";
  import { ElMessage } from "element-plus";
  import { ScopeType, EntityType, CallTypes } from "@/views/dashboard/data";
  import type { Option } from "@/types/app";
  import { useQueryTopologyExpressionsProcessor } from "@/hooks/useExpressionsProcessor";
  import type { DashboardItem, MetricConfigOpt } from "@/types/dashboard";
  import type { Node } from "@/types/topology";
  import Metrics from "./Metrics.vue";

  /*global defineEmits */
  const emit = defineEmits(["update", "updateNodes"]);
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const topologyStore = useTopologyStore();
  const { selectedGrid } = dashboardStore;
  const nodeDashboard =
    selectedGrid.nodeDashboard && selectedGrid.nodeDashboard.length ? selectedGrid.nodeDashboard : "";
  const isService = [EntityType[0].value, EntityType[1].value].includes(dashboardStore.entity);
  const items = reactive<
    {
      scope: string;
      dashboard: string;
    }[]
  >(isService && nodeDashboard ? nodeDashboard : [{ scope: "", dashboard: "" }]);
  const states = reactive<{
    linkDashboard: string;
    nodeDashboard: {
      scope: string;
      dashboard: string;
    }[];
    linkDashboards: (DashboardItem & { label: string; value: string })[];
    nodeDashboards: (DashboardItem & { label: string; value: string })[];
    linkServerExpressions: string[];
    linkClientExpressions: string[];
    nodeExpressions: string[];
  }>({
    linkDashboard: selectedGrid.linkDashboard || "",
    nodeDashboard: selectedGrid.nodeDashboard || [],
    linkDashboards: [],
    nodeDashboards: [],
    linkServerExpressions: selectedGrid.linkServerExpressions || [],
    linkClientExpressions: selectedGrid.linkClientExpressions || [],
    nodeExpressions: selectedGrid.nodeExpressions || [],
  });
  const legendMQE = ref<{ expression: string }>(selectedGrid.legendMQE || { expression: "" });
  const configType = ref<string>("");
  const description = reactive<any>(selectedGrid.description || {});

  getDashboardList();
  async function getDashboardList() {
    const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
    const entity =
      dashboardStore.entity === EntityType[1].value
        ? EntityType[0].value
        : dashboardStore.entity === EntityType[4].value
        ? EntityType[3].value
        : dashboardStore.entity;
    states.linkDashboards = list.reduce(
      (prev: (DashboardItem & { label: string; value: string })[], d: DashboardItem) => {
        if (d.layer === dashboardStore.layerId && d.entity === entity + "Relation") {
          prev.push({ ...d, label: d.name, value: d.name });
        }
        return prev;
      },
      [],
    );
    if (isService) {
      return;
    }
    states.nodeDashboards = list.reduce(
      (prev: (DashboardItem & { label: string; value: string })[], d: DashboardItem) => {
        if (d.layer === dashboardStore.layerId && d.entity === entity) {
          prev.push({ ...d, label: d.name, value: d.name });
        }
        return prev;
      },
      [],
    );
  }
  async function setLegend() {
    updateSettings();
    const expression = dashboardStore.selectedGrid.legendMQE && dashboardStore.selectedGrid.legendMQE.expression;
    const { getExpressionQuery } = useQueryTopologyExpressionsProcessor(
      [expression],
      topologyStore.nodes.filter((d: Node) => d.isReal),
    );
    const param = getExpressionQuery();
    const res = await topologyStore.getTopologyExpressionValue(param);
    if (res.errors) {
      ElMessage.error(res.errors);
    } else {
      topologyStore.setLegendValues([expression], res.data);
    }
  }
  function changeNodeDashboard(opt: any) {
    states.nodeDashboard = opt[0].value;
    updateSettings();
  }
  function changeLinkDashboard(opt: any) {
    states.linkDashboard = opt[0].value;
    updateSettings();
  }
  function changeScope(index: number, opt: Option[] | any) {
    items[index].scope = opt[0].value;
    const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
    states.nodeDashboards = list.reduce(
      (prev: (DashboardItem & { label: string; value: string })[], d: DashboardItem) => {
        if (d.layer === dashboardStore.layerId && d.entity === opt[0].value) {
          prev.push({ ...d, label: d.name, value: d.name });
        }
        return prev;
      },
      [],
    );
    items[index].dashboard = states.nodeDashboards[0].value;
    updateSettings();
  }
  function updateNodeDashboards(index: number, content: Option[] | any) {
    items[index].dashboard = content[0].value;
    updateSettings();
  }
  function addItem() {
    items.push({ scope: "", dashboard: "" });
  }
  function deleteItem(index: number) {
    if (items.length === 1) {
      items.push({ scope: "", dashboard: "" });
    }
    items.splice(index, 1);
    updateSettings();
  }
  function updateSettings(metricConfig?: { [key: string]: MetricConfigOpt[] }) {
    const param = {
      ...dashboardStore.selectedGrid,
      linkDashboard: states.linkDashboard,
      nodeDashboard: isService
        ? items.filter((d: { scope: string; dashboard: string }) => d.dashboard)
        : states.nodeDashboard,
      linkServerExpressions: states.linkServerExpressions,
      linkClientExpressions: states.linkClientExpressions,
      nodeExpressions: states.nodeExpressions,
      legendMQE: legendMQE.value,
      ...metricConfig,
      description,
    };
    dashboardStore.selectWidget(param);
    dashboardStore.setConfigs(param);
    emit("update", param);
  }

  function changeLinkServerExpressions(param: string[]) {
    states.linkServerExpressions = param;
    updateSettings();
    if (!states.linkServerExpressions.length) {
      topologyStore.setLinkServerMetrics({});
      return;
    }
    topologyStore.getLinkExpressions(states.linkServerExpressions, CallTypes.Server);
  }
  function changeLinkClientExpressions(param: string[]) {
    states.linkClientExpressions = param;
    updateSettings();
    if (!states.linkClientExpressions.length) {
      topologyStore.changeLinkClientMetrics({});
      return;
    }
    topologyStore.getLinkExpressions(states.linkClientExpressions, CallTypes.Client);
  }

  function setConfigType(type: string) {
    configType.value = type;
  }
  function changeNodeExpressions(param: string[]) {
    states.nodeExpressions = param;
    updateSettings();
    if (!states.nodeExpressions.length) {
      topologyStore.setNodeMetricValue({});
      return;
    }
    topologyStore.queryNodeExpressions(states.nodeExpressions);
  }
</script>
<style lang="scss" scoped>
  .inputs {
    margin-top: 8px;
    width: 355px;
  }

  .legend-inputs {
    margin-top: 8px;
    width: 310px;
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
    color: var(--sw-topology-color);
    margin-bottom: 0;
  }

  .label {
    font-size: $font-size-smaller;
    margin-top: 10px;
    color: var(--sw-topology-color);
  }

  .legend-btn {
    cursor: pointer;
  }

  .delete {
    margin: 0 3px;
  }
</style>
