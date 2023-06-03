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
  <div v-if="states.isList" class="ds-name">
    <div>{{ t("dashboards") }}</div>
    <Selector
      :value="states.dashboardName || ''"
      :options="states.dashboardList"
      size="small"
      placeholder="Please select a dashboard name"
      @change="changeDashboard"
      class="selectors"
      :clearable="true"
    />
  </div>
  <div>{{ t("metrics") }}</div>
  <el-switch
    v-model="isExpression"
    class="mb-5 mt-5"
    active-text="Expressions"
    inactive-text="General"
    size="small"
    @change="changeMetricMode"
  />
  <div v-for="(metric, index) in states.metrics" :key="index" class="metric-item">
    <!-- <el-input
      v-if="isExpression"
      class="selectors"
      size="small"
      placeholder="Please input a expression"
      @change="changeExpression"
    /> -->
    <div v-if="isExpression" id="expression-param" contenteditable="true" @blur="changeExpression($event, index)">
      {{ metric }}
    </div>
    <span v-else>
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
        :disabled="graph.type && !states.isList && index !== 0"
        @change="changeMetricType(index, $event)"
        class="selectors"
      />
    </span>
    <el-popover placement="top" :width="400" trigger="click">
      <template #reference>
        <span @click="setMetricConfig(index)">
          <Icon class="cp mr-5" iconName="mode_edit" size="middle" />
        </span>
      </template>
      <Standard @update="queryMetrics" :currentMetricConfig="currentMetricConfig" :index="index" />
    </el-popover>
    <span
      v-show="
        states.isList ||
        [ProtocolTypes.ReadMetricsValues, ExpressionResultType.TIME_SERIES_VALUES as string].includes(states.metricTypes[0])
      "
    >
      <Icon
        class="cp mr-5"
        v-if="index === states.metrics.length - 1 && states.metrics.length < defaultLen"
        iconName="add_circle_outlinecontrol_point"
        size="middle"
        @click="addMetric"
      />
      <Icon class="cp" iconName="remove_circle_outline" size="middle" @click="deleteMetric(index)" />
    </span>
    <span v-if="states.tips[index]" class="ml-10 red">{{ states.tips[index] }}</span>
  </div>
  <div>{{ t("visualization") }}</div>
  <div class="chart-types">
    <span
      v-for="(type, index) in setVisTypes"
      :key="index"
      @click="changeChartType(type)"
      :class="{
        active: type.value === graph.type,
      }"
    >
      {{ type.label }}
    </span>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed } from "vue";
  import type { Option } from "@/types/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import {
    MetricTypes,
    ListChartTypes,
    DefaultGraphConfig,
    EntityType,
    ChartTypes,
    PodsChartTypes,
    MetricsType,
    ProtocolTypes,
    ExpressionResultType,
    MetricModes,
  } from "../../../data";
  import { ElMessage } from "element-plus";
  import Icon from "@/components/Icon.vue";
  import { useQueryProcessor, useSourceProcessor } from "@/hooks/useMetricsProcessor";
  import { useExpressionsQueryProcessor, useExpressionsSourceProcessor } from "@/hooks/useExpressionsProcessor";
  import { useI18n } from "vue-i18n";
  import type { DashboardItem, MetricConfigOpt } from "@/types/dashboard";
  import Standard from "./Standard.vue";

  /*global defineEmits */
  const { t } = useI18n();
  const emit = defineEmits(["update", "loading"]);
  const dashboardStore = useDashboardStore();
  const isExpression = ref<boolean>(dashboardStore.selectedGrid.metricMode === MetricModes.Expression ? true : false);
  const metrics = computed(
    () => (isExpression.value ? dashboardStore.selectedGrid.expressions : dashboardStore.selectedGrid.metrics) || [],
  );
  const graph = computed(() => dashboardStore.selectedGrid.graph || {});
  const metricTypes = computed(
    () => (isExpression.value ? dashboardStore.selectedGrid.typesOfMQE : dashboardStore.selectedGrid.metricTypes) || [],
  );
  const states = reactive<{
    metrics: string[];
    metricTypes: string[];
    metricTypeList: Option[][];
    isList: boolean;
    metricList: (Option & { type: string })[];
    dashboardName: string;
    dashboardList: ((DashboardItem & { label: string; value: string }) | any)[];
    tips: string[];
  }>({
    metrics: metrics.value.length ? metrics.value : [""],
    metricTypes: metricTypes.value.length ? metricTypes.value : [""],
    metricTypeList: [],
    isList: false,
    metricList: [],
    dashboardName: graph.value.dashboardName,
    dashboardList: [{ label: "", value: "" }],
    tips: [],
  });
  const currentMetricConfig = ref<MetricConfigOpt>({
    unit: "",
    label: "",
    labelsIndex: "",
    calculation: "",
    sortOrder: "DES",
  });

  states.isList = ListChartTypes.includes(graph.value.type);
  const defaultLen = ref<number>(states.isList ? 5 : 20);
  const backupMetricConfig = ref<MetricConfigOpt[]>([]);

  setDashboards();
  setMetricType();

  const setVisTypes = computed(() => {
    let graphs = [];
    if (dashboardStore.entity === EntityType[0].value) {
      graphs = ChartTypes.filter((d: Option) => ![ChartTypes[7].value, ChartTypes[8].value].includes(d.value));
    } else if (dashboardStore.entity === EntityType[1].value) {
      graphs = ChartTypes.filter((d: Option) => !PodsChartTypes.includes(d.value));
    } else {
      graphs = ChartTypes.filter((d: Option) => !ListChartTypes.includes(d.value));
    }

    return graphs;
  });

  async function setMetricType(chart?: any) {
    const g = chart || dashboardStore.selectedGrid.graph || {};
    let arr: any[] = states.metricList;
    if (!chart) {
      const json = await dashboardStore.fetchMetricList();
      if (json.errors) {
        ElMessage.error(json.errors);
        return;
      }
      arr = json.data.metrics;
    }
    states.metricList = (arr || []).filter((d: { type: string }) => {
      if (states.isList) {
        if (d.type === MetricsType.REGULAR_VALUE || d.type === MetricsType.LABELED_VALUE) {
          return d;
        }
      } else if (g.type === "Table") {
        if (d.type === MetricsType.LABELED_VALUE || d.type === MetricsType.REGULAR_VALUE) {
          return d;
        }
      } else {
        return d;
      }
    });
    const metrics: any = states.metricList.filter((d: { value: string; type: string }) =>
      states.metrics.includes(d.value),
    );

    if (metrics.length) {
      // keep states.metrics index
      const m = metrics.map((d: { value: string }) => d.value);
      states.metrics = states.metrics.filter((d) => m.includes(d));
    } else {
      states.metrics = [""];
      states.metricTypes = [""];
    }
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      metrics: states.metrics,
      metricTypes: states.metricTypes,
      graph: g,
    });
    states.metricTypeList = [];
    for (const metric of metrics) {
      if (states.metrics.includes(metric.value)) {
        const arr = setMetricTypeList(metric.type);
        states.metricTypeList.push(arr);
      }
    }
    if (states.metrics && states.metrics[0]) {
      queryMetrics();
    } else {
      emit("update", {});
    }
  }

  function setDashboards(type?: string) {
    const chart = type || (dashboardStore.selectedGrid.graph && dashboardStore.selectedGrid.graph.type);
    const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
    const arr = list.reduce((prev: (DashboardItem & { label: string; value: string })[], d: DashboardItem) => {
      if (d.layer === dashboardStore.layerId) {
        if (
          (d.entity === EntityType[0].value && chart === "ServiceList") ||
          (d.entity === EntityType[2].value && chart === "EndpointList") ||
          (d.entity === EntityType[3].value && chart === "InstanceList")
        ) {
          prev.push({
            ...d,
            value: d.name,
            label: d.name,
          });
        }
      }
      return prev;
    }, []);

    states.dashboardList = arr.length ? arr : [{ label: "", value: "" }];
  }

  function changeChartType(item: Option) {
    const chart = DefaultGraphConfig[item.value] || {};
    states.isList = ListChartTypes.includes(chart.type);
    if (states.isList) {
      dashboardStore.selectWidget({
        ...dashboardStore.selectedGrid,
        metrics: [""],
        metricTypes: [""],
      });
      states.metrics = [""];
      states.metricTypes = [""];
      defaultLen.value = 5;
    }
    setMetricType(chart);
    setDashboards(chart.type);
    states.dashboardName = "";
    defaultLen.value = 10;
  }

  function changeMetrics(index: number, arr: (Option & { type: string })[] | any) {
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

    states.metricTypeList[index] = setMetricTypeList(typeOfMetrics);
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
    const metric = states.metricList.filter((d: Option) => states.metrics[index] === d.value)[0] || {};
    const l = setMetricTypeList(metric.type);
    if (states.isList) {
      states.metricTypes[index] = opt[0].value;
      states.metricTypeList[index] = l;
    } else {
      states.metricTypes = states.metricTypes.map((d: string) => {
        d = opt[0].value;
        return d;
      });
      states.metricTypeList = states.metricTypeList.map((d: Option[]) => {
        d = l;

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
    if (states.isList) {
      return;
    }
    if (isExpression.value) {
      queryMetricsWithExpressions();
      return;
    }
    const { metricConfig, metricTypes, metrics } = dashboardStore.selectedGrid;
    if (!(metrics && metrics[0] && metricTypes && metricTypes[0])) {
      return;
    }
    const params = useQueryProcessor({ ...states, metricConfig });
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
    const source = useSourceProcessor(json, { ...states, metricConfig });
    emit("update", source);
  }

  async function queryMetricsWithExpressions() {
    const { metricConfig, typesOfMQE, expressions } = dashboardStore.selectedGrid;
    if (!(expressions && expressions[0] && typesOfMQE && typesOfMQE[0])) {
      return;
    }

    const params = useExpressionsQueryProcessor({ ...states, metricConfig });
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
    const source = useExpressionsSourceProcessor(json, { ...states, metricConfig });
    emit("update", source);
  }

  function changeDashboard(opt: any) {
    if (!opt[0]) {
      states.dashboardName = "";
    } else {
      states.dashboardName = opt[0].value;
    }
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
    states.tips.push("");
    if (!states.isList) {
      states.metricTypes.push(states.metricTypes[0]);
      if (!isExpression.value) {
        states.metricTypeList.push(states.metricTypeList[0]);
      }
      return;
    }
    states.metricTypes.push("");
  }
  function deleteMetric(index: number) {
    if (states.metrics.length === 1) {
      states.metrics = [""];
      states.metricTypes = [""];
      states.tips = [""];
      dashboardStore.selectWidget({
        ...dashboardStore.selectedGrid,
        ...{ metricTypes: states.metricTypes, metrics: states.metrics },
        metricConfig: [],
      });
      return;
    }
    states.metrics.splice(index, 1);
    states.metricTypes.splice(index, 1);
    states.tips.splice(index, 1);
    const config = dashboardStore.selectedGrid.metricConfig || [];
    const metricConfig = config[index] ? config.splice(index, 1) : config;
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      ...{ metricTypes: states.metricTypes, metrics: states.metrics },
      metricConfig,
    });
  }
  function setMetricTypeList(type: string) {
    if (type !== MetricsType.REGULAR_VALUE) {
      return MetricTypes[type];
    }
    if (states.isList || graph.value.type === "Table") {
      return [MetricTypes.REGULAR_VALUE[0], MetricTypes.REGULAR_VALUE[1]];
    }
    return MetricTypes[type];
  }
  function setMetricConfig(index: number) {
    const n = {
      unit: "",
      label: "",
      calculation: "",
      labelsIndex: "",
      sortOrder: "DES",
    };
    if (!dashboardStore.selectedGrid.metricConfig || !dashboardStore.selectedGrid.metricConfig[index]) {
      currentMetricConfig.value = n;
      return;
    }
    currentMetricConfig.value = {
      ...n,
      ...dashboardStore.selectedGrid.metricConfig[index],
    };
  }
  function changeMetricMode() {
    states.metrics = metrics.value.length ? metrics.value : [""];
    states.metricTypes = metricTypes.value.length ? metricTypes.value : [""];
    const config = dashboardStore.selectedGrid.metricTypes;
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      metricMode: isExpression.value ? MetricModes.Expression : MetricModes.General,
      metricTypes: backupMetricConfig.value,
    });
    backupMetricConfig.value = config;
  }
  async function changeExpression(event: any, index: number) {
    const params = event.target.textContent;
    if (params) {
      const resp = await dashboardStore.getTypeOfMQE(params);
      states.metrics[index] = params;
      states.metricTypes[index] = resp.data.metricType.type;
      states.tips[index] = resp.data.metricType.error || "";
    } else {
      states.metrics[index] = params;
      states.metricTypes[index] = "";
      states.tips[index] = "";
    }

    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      expressions: states.metrics,
      typesOfMQE: states.metricTypes,
    });
    if (params) {
      await queryMetrics();
    }
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
      padding: 2px 10px;
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

  #expression-param {
    display: inline-block;
    width: 500px;
    border: 1px solid #dcdfe6;
    cursor: text;
    padding: 0 5px;
    border-radius: 3px;
    color: #606266;
    outline: none;
    height: 26px;
    margin-right: 5px;

    &:focus {
      border-color: #409eff;
    }
  }
</style>
