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
  <div class="mt-20">
    <h5 class="title">{{ t("metricMode") }}</h5>
    <el-switch
      v-model="isExpression"
      class="mt-5"
      active-text="Expressions"
      inactive-text="General"
      size="small"
      @change="changeMetricMode"
    />
  </div>
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
      <el-popover
        placement="left"
        :width="400"
        trigger="click"
        v-if="isExpression ? states.linkServerExpressions.length : states.linkServerMetrics.length"
      >
        <template #reference>
          <span @click="setConfigType('linkServerMetricConfig')">
            <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
          </span>
        </template>
        <Metrics :type="configType" :isExpression="isExpression" @update="updateSettings" />
      </el-popover>
    </div>
    <div v-if="isExpression">
      <Tags
        :tags="states.linkServerExpressions"
        :vertical="true"
        :text="t('addExpressions')"
        @change="(param: string[]) => changeLinkServerExpressions(param)"
      />
    </div>
    <Selector
      v-else
      class="inputs"
      :multiple="true"
      :value="states.linkServerMetrics"
      :options="states.linkMetricList"
      size="small"
      placeholder="Select metrics"
      @change="updateLinkServerMetrics"
    />
    <span v-show="dashboardStore.entity !== EntityType[2].value">
      <div class="label">
        <span>{{ t("linkClientMetrics") }}</span>
        <el-popover
          placement="left"
          :width="400"
          trigger="click"
          v-if="isExpression ? states.linkClientExpressions.length : states.linkClientMetrics.length"
        >
          <template #reference>
            <span @click="setConfigType('linkClientMetricConfig')">
              <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
            </span>
          </template>
          <Metrics :type="configType" :isExpression="isExpression" @update="updateSettings" />
        </el-popover>
      </div>
      <div v-if="isExpression">
        <Tags
          :tags="states.linkClientExpressions"
          :vertical="true"
          :text="t('addExpressions')"
          @change="(param: string[]) => changeLinkClientExpressions(param)"
        />
      </div>
      <Selector
        v-else
        class="inputs"
        :multiple="true"
        :value="states.linkClientMetrics"
        :options="states.linkMetricList"
        size="small"
        placeholder="Select metrics"
        @change="updateLinkClientMetrics"
      />
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
      <el-popover
        placement="left"
        :width="400"
        trigger="click"
        v-if="isExpression ? states.nodeExpressions.length : states.nodeMetrics.length"
      >
        <template #reference>
          <span @click="setConfigType('nodeMetricConfig')">
            <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
          </span>
        </template>
        <Metrics :type="configType" :isExpression="isExpression" @update="updateSettings" />
      </el-popover>
    </div>
    <div v-if="isExpression">
      <Tags
        :tags="states.nodeExpressions"
        :vertical="true"
        :text="t('addExpressions')"
        @change="(param: string[]) => changeNodeExpressions(param)"
      />
    </div>
    <Selector
      v-else
      class="inputs"
      :multiple="true"
      :value="states.nodeMetrics"
      :options="states.nodeMetricList"
      size="small"
      placeholder="Select metrics"
      @change="updateNodeMetrics"
    />
  </div>
  <div v-show="isService">
    <h5 class="title">{{ t("legendSettings") }}</h5>
    <span v-if="isExpression">
      <div class="label">Healthy Description</div>
      <el-input v-model="description.healthy" placeholder="Please input description" size="small" class="mt-5" />
    </span>
    <div class="label">
      <span>{{ t(isExpression ? "unhealthyExpression" : "conditions") }}</span>
      <el-tooltip
        class="cp"
        v-if="isExpression"
        content="The node would be red to indicate unhealthy status when the expression return greater than 0"
      >
        <span>
          <Icon class="icon-help ml-5" iconName="help" size="small" />
        </span>
      </el-tooltip>
    </div>
    <div v-if="isExpression">
      <el-input v-model="legendMQE.expression" placeholder="Please input a expression" size="small" class="inputs" />
    </div>
    <div v-for="(metric, index) of legend" :key="index" v-else>
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
        type="number"
        @change="changeLegend(LegendOpt.VALUE, $event, index)"
        size="small"
        class="item"
      />
      <span>
        <Icon class="cp delete" iconName="remove_circle_outline" size="middle" @click="deleteMetric(index)" />
        <Icon
          class="cp"
          iconName="add_circle_outlinecontrol_point"
          size="middle"
          v-show="index === legend.length - 1 && legend.length < 5"
          @click="addMetric"
        />
      </span>
      <div v-show="index !== legend.length - 1">&&</div>
    </div>
    <span v-if="!isExpression">
      <div class="label">Healthy Description</div>
      <el-input v-model="description.healthy" placeholder="Please input description" size="small" class="mt-5" />
    </span>
    <div class="label">Unhealthy Description</div>
    <el-input v-model="description.unhealthy" placeholder="Please input description" size="small" class="mt-5" />
    <el-button @click="setLegend" class="mt-20" size="small" type="primary">
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
  import {
    MetricCatalog,
    ScopeType,
    MetricConditions,
    EntityType,
    LegendOpt,
    MetricsType,
    MetricModes,
    CallTypes,
  } from "@/views/dashboard/data";
  import type { Option } from "@/types/app";
  import { useQueryTopologyMetrics } from "@/hooks/useMetricsProcessor";
  import { useQueryTopologyExpressionsProcessor } from "@/hooks/useExpressionsProcessor";
  import type { Node } from "@/types/topology";
  import type { DashboardItem, MetricConfigOpt } from "@/types/dashboard";
  import Metrics from "./Metrics.vue";

  /*global defineEmits */
  const emit = defineEmits(["update", "updateNodes"]);
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const topologyStore = useTopologyStore();
  const { selectedGrid } = dashboardStore;
  const isExpression = ref<boolean>(dashboardStore.selectedGrid.metricMode === MetricModes.Expression);
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
    linkServerMetrics: string[];
    linkClientMetrics: string[];
    nodeMetrics: string[];
    nodeMetricList: Option[];
    linkMetricList: Option[];
    linkDashboards: (DashboardItem & { label: string; value: string })[];
    nodeDashboards: (DashboardItem & { label: string; value: string })[];
    linkServerExpressions: string[];
    linkClientExpressions: string[];
    nodeExpressions: string[];
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
    linkServerExpressions: selectedGrid.linkServerExpressions || [],
    linkClientExpressions: selectedGrid.linkClientExpressions || [],
    nodeExpressions: selectedGrid.nodeExpressions || [],
  });
  const l = selectedGrid.legend && selectedGrid.legend.length;
  const legend = ref<{ name: string; condition: string; value: string }[]>(
    l ? selectedGrid.legend : [{ name: "", condition: "", value: "" }],
  );
  const legendMQE = ref<{ expression: string }>(selectedGrid.legendMQE || { expression: "" });
  const configType = ref<string>("");
  const description = reactive<any>(selectedGrid.description || {});

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
      (prev: (DashboardItem & { label: string; value: string })[], d: DashboardItem) => {
        if (d.layer === dashboardStore.layerId && d.entity === entity + "Relation") {
          prev.push({ ...d, label: d.name, value: d.name });
        }
        return prev;
      },
      [],
    );
    states.nodeMetricList = (json.data.metrics || []).filter(
      (d: { type: string }) => d.type === MetricsType.REGULAR_VALUE,
    );
    states.linkMetricList = (json.data.metrics || []).filter(
      (d: { catalog: string; type: string }) =>
        entity + "Relation" === (MetricCatalog as any)[d.catalog] && d.type === MetricsType.REGULAR_VALUE,
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
    if (isExpression.value) {
      const expression = dashboardStore.selectedGrid.legendMQE && dashboardStore.selectedGrid.legendMQE.expression;
      if (!expression) {
        emit("updateNodes");
        return;
      }
      const { getExpressionQuery } = useQueryTopologyExpressionsProcessor([expression], topologyStore.nodes);
      const param = getExpressionQuery();
      const res = await topologyStore.getNodeExpressionValue(param);
      if (res.errors) {
        ElMessage.error(res.errors);
      } else {
        topologyStore.setLegendValues([expression], res.data);
      }
    } else {
      const names = dashboardStore.selectedGrid.legend.map((d: any) => d.name && d.condition && d.value);
      if (!names.length) {
        emit("updateNodes");
        return;
      }
      const ids = topologyStore.nodes.map((d: Node) => d.id);
      const param = await useQueryTopologyMetrics(names, ids);
      const res = await topologyStore.getLegendMetrics(param);

      if (res.errors) {
        ElMessage.error(res.errors);
      }
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
    (legend.value[index] as any)[type] = opt[0].value || opt;
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
    let metrics = [];
    if (isExpression.value) {
      metrics = legend.value.filter((d: any) => d.name);
    } else {
      metrics = legend.value.filter((d: any) => d.name && d.value && d.condition);
    }

    const param = {
      ...dashboardStore.selectedGrid,
      linkDashboard: states.linkDashboard,
      nodeDashboard: isService
        ? items.filter((d: { scope: string; dashboard: string }) => d.dashboard)
        : states.nodeDashboard,
      linkServerMetrics: states.linkServerMetrics,
      linkClientMetrics: states.linkClientMetrics,
      nodeMetrics: states.nodeMetrics,
      linkServerExpressions: states.linkServerExpressions,
      linkClientExpressions: states.linkClientExpressions,
      nodeExpressions: states.nodeExpressions,
      metricMode: isExpression.value ? MetricModes.Expression : MetricModes.General,
      legend: metrics,
      legendMQE: legendMQE.value,
      ...metricConfig,
      description,
    };
    dashboardStore.selectWidget(param);
    dashboardStore.setConfigs(param);
    emit("update", param);
  }
  function updateLinkServerMetrics(options: Option[] | any) {
    const opt = options.map((d: Option) => d.value);
    const index = states.linkServerMetrics.findIndex((d: any) => !opt.includes(d));
    states.linkServerMetrics = opt;
    if (index < 0) {
      changeLinkServerMetrics();
      return;
    }
    const origin = dashboardStore.selectedGrid.linkServerMetricConfig || [];
    const config = origin.length === 1 ? [] : origin.splice(index, 1);
    changeLinkServerMetrics({ linkServerMetricConfig: config });
  }
  async function changeLinkServerMetrics(config?: { [key: string]: MetricConfigOpt[] }) {
    updateSettings(config);
    if (!states.linkServerMetrics.length) {
      topologyStore.setLinkServerMetrics({});
      return;
    }
    topologyStore.getLinkServerMetrics(states.linkServerMetrics);
  }
  function changeLinkServerExpressions(param: string[]) {
    if (!isExpression.value) {
      return;
    }
    states.linkServerExpressions = param;
    updateSettings();
    if (!states.linkServerExpressions.length) {
      topologyStore.setLinkServerMetrics({});
      return;
    }
    topologyStore.getLinkExpressions(states.linkServerExpressions, CallTypes.Server);
  }
  function changeLinkClientExpressions(param: string[]) {
    if (!isExpression.value) {
      return;
    }
    states.linkClientExpressions = param;
    updateSettings();
    if (!states.linkClientExpressions.length) {
      topologyStore.changeLinkClientMetrics({});
      return;
    }
    topologyStore.getLinkExpressions(states.linkClientExpressions, CallTypes.Client);
  }
  function updateLinkClientMetrics(options: Option[] | any) {
    const opt = options.map((d: Option) => d.value);
    const index = states.linkClientMetrics.findIndex((d: any) => !opt.includes(d));
    states.linkClientMetrics = opt;
    if (index < 0) {
      changeLinkClientMetrics();
      return;
    }
    const origin = dashboardStore.selectedGrid.linkClientMetricConfig || [];
    const config = origin.length === 1 ? [] : origin.splice(index, 1);
    changeLinkClientMetrics({ linkClientMetricConfig: config });
  }
  async function changeLinkClientMetrics(config?: { [key: string]: MetricConfigOpt[] }) {
    updateSettings(config);
    if (!states.linkClientMetrics.length) {
      topologyStore.setLinkClientMetrics({});
      return;
    }
    topologyStore.getLinkClientMetrics(states.linkClientMetrics);
  }
  function updateNodeMetrics(options: Option[] | any) {
    const opt = options.map((d: Option) => d.value);
    const index = states.nodeMetrics.findIndex((d: any) => !opt.includes(d));
    states.nodeMetrics = opt;
    if (index < 0) {
      changeNodeMetrics();
      return;
    }
    const origin = dashboardStore.selectedGrid.nodeMetricConfig || [];
    const config = origin.length === 1 ? [] : origin.splice(index, 1);
    changeNodeMetrics({ nodeMetricConfig: config });
  }
  async function changeNodeMetrics(config?: { [key: string]: MetricConfigOpt[] }) {
    updateSettings(config);
    if (!states.nodeMetrics.length) {
      topologyStore.setNodeMetricValue({});
      return;
    }
    topologyStore.queryNodeMetrics(states.nodeMetrics);
  }
  function deleteMetric(index: number) {
    if (legend.value.length === 1) {
      legend.value = [{ name: "", condition: "", value: "" }];
      return;
    }
    legend.value.splice(index, 1);
  }
  function addMetric() {
    legend.value.push({ name: "", condition: "", value: "" });
  }
  function setConfigType(type: string) {
    configType.value = type;
  }
  function changeNodeExpressions(param: string[]) {
    if (!isExpression.value) {
      return;
    }
    states.nodeExpressions = param;
    updateSettings();
    if (!states.nodeExpressions.length) {
      topologyStore.setNodeMetricValue({});
      return;
    }
    topologyStore.queryNodeExpressions(states.nodeExpressions);
  }
  function changeMetricMode() {
    legend.value = [{ name: "", condition: "", value: "" }];
    const config = {
      linkServerMetricConfig: [],
      linkClientMetricConfig: [],
      nodeMetricConfig: [],
    };
    if (isExpression.value) {
      states.linkServerMetrics = [];
      states.linkClientMetrics = [];
      states.nodeMetrics = [];
    } else {
      states.linkServerExpressions = [];
      states.linkClientExpressions = [];
      states.nodeExpressions = [];
    }

    updateSettings(config);
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
