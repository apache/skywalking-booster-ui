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
  <div class="flex-h">
    <div>{{ t("metrics") }}</div>
    <div class="link">
      <a target="_blank" href="https://skywalking.apache.org/docs/main/next/en/api/metrics-query-expression/">
        <Icon iconName="info_outline" size="middle" />
      </a>
    </div>
  </div>
  <div v-if="states.isList">
    <span class="title">{{ t("summary") }}</span>
    <span>{{ t("detail") }}</span>
  </div>
  <div v-for="(metric, index) in states.metrics" :key="index" class="mb-10">
    <span>
      <div class="expression-param" contenteditable="true" @blur="changeExpression($event, index)">
        {{ metric }}
      </div>
      <div
        v-if="states.isList"
        class="expression-param"
        contenteditable="true"
        @blur="changeSubExpression($event, index)"
      >
        {{ states.subMetrics[index] }}
      </div>
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
        [ExpressionResultType.TIME_SERIES_VALUES as string].includes(states.metricTypes[0])
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
    <div v-if="(states.tips || [])[index]" class="ml-10 red sm">
      {{ states.tips[index] }}
    </div>
    <div v-if="(errors || [])[index]" class="ml-10 red sm">
      {{ (errors || [])[index] }}
    </div>
    <div v-if="(subErrors || [])[index]" class="ml-10 red sm">
      {{ (subErrors || [])[index] }}
    </div>
  </div>
  <div>{{ t("visualization") }}</div>
  <div class="chart-types">
    <span
      v-for="(type, index) in setVisTypes"
      :key="index"
      @click="changeChartType(type)"
      :class="{ active: type.value === graph.type }"
    >
      {{ type.label }}
    </span>
  </div>
  <div v-if="states.isTopList" class="mt-10">
    <div>{{ t("valueDashboard") }}</div>
    <div>
      <Selector
        :value="states.valueRelatedDashboard || ''"
        :options="states.dashboardList"
        size="small"
        placeholder="Please select a dashboard name"
        @change="changeValueDashboard"
        class="selectors"
        :clearable="true"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed } from "vue";
  import type { PropType } from "vue";
  import type { Option } from "@/types/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import {
    ListChartTypes,
    DefaultGraphConfig,
    EntityType,
    ChartTypes,
    PodsChartTypes,
    ExpressionResultType,
  } from "@/views/dashboard/data";
  import Icon from "@/components/Icon.vue";
  import { useDashboardQueryProcessor } from "@/hooks/useExpressionsProcessor";
  import { useI18n } from "vue-i18n";
  import type { DashboardItem, MetricConfigOpt } from "@/types/dashboard";
  import Standard from "./Standard.vue";

  /*global defineEmits, Indexable */
  const { t } = useI18n();
  const emit = defineEmits(["update", "loading"]);
  /*global defineProps */
  defineProps({
    errors: {
      type: Array as PropType<string[]>,
    },
    subErrors: {
      type: Array as PropType<string[]>,
    },
  });
  const dashboardStore = useDashboardStore();
  const metrics = computed(() => dashboardStore.selectedGrid.expressions || []);
  const subMetrics = computed(() => dashboardStore.selectedGrid.subExpressions || []);
  const subMetricTypes = computed(() => dashboardStore.selectedGrid.subTypesOfMQE || []);
  const graph = computed(() => dashboardStore.selectedGrid.graph || {});
  const typesOfMQE = computed(() => dashboardStore.selectedGrid.typesOfMQE || []);
  const states = reactive<{
    metrics: string[];
    subMetrics: string[];
    subMetricTypes: string[];
    metricTypes: string[];
    metricTypeList: Option[][];
    isList: boolean;
    isTopList: boolean;
    dashboardName: string;
    dashboardList: ((DashboardItem & { label: string; value: string }) | any)[];
    tips: string[];
    subTips: string[];
    valueRelatedDashboard: string;
  }>({
    metrics: metrics.value.length ? metrics.value : [""],
    metricTypes: typesOfMQE.value.length ? typesOfMQE.value : [""],
    metricTypeList: [],
    isList: false,
    isTopList: false,
    dashboardName: graph.value.dashboardName,
    dashboardList: [{ label: "", value: "" }],
    tips: [],
    subTips: [],
    subMetrics: subMetrics.value.length ? subMetrics.value : [""],
    subMetricTypes: subMetricTypes.value.length ? subMetricTypes.value : [""],
    valueRelatedDashboard: dashboardStore.selectedGrid.valueRelatedDashboard,
  });
  const currentMetricConfig = ref<MetricConfigOpt>({
    unit: "",
    label: "",
    labelsIndex: "",
    sortOrder: "DES",
  });

  states.isTopList = graph.value.type === ChartTypes[4].value;
  states.isList = ListChartTypes.includes(graph.value.type);
  const defaultLen = ref<number>(states.isList ? 5 : 20);

  setDashboards();

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

  function setDashboards(type?: string) {
    const chart = type || (dashboardStore.selectedGrid.graph && dashboardStore.selectedGrid.graph.type);
    const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
    const arr = list.reduce((prev: (DashboardItem & { label: string; value: string })[], d: DashboardItem) => {
      if (d.layer === dashboardStore.layerId) {
        if (
          (d.entity === EntityType[0].value && chart === ChartTypes[8].value) ||
          (d.entity === EntityType[2].value && chart === ChartTypes[9].value) ||
          (d.entity === EntityType[3].value && chart === ChartTypes[10].value) ||
          states.isTopList
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
    if (states.metrics && states.metrics[0]) {
      queryMetrics();
    } else {
      emit("update", {});
    }
  }

  function changeChartType(item: Option) {
    const chart = DefaultGraphConfig[item.value] || {};
    states.isList = ListChartTypes.includes(chart.type);
    if (states.isList) {
      dashboardStore.selectWidget({
        ...dashboardStore.selectedGrid,
        expressions: [""],
        typesOfMQE: [""],
      });
      states.metrics = [""];
      states.metricTypes = [""];
      defaultLen.value = 5;
    }

    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      graph: chart,
    });
    setDashboards(chart.type);
    states.dashboardName = "";
    defaultLen.value = 10;
  }

  async function queryMetrics() {
    if (states.isList) {
      return;
    }
    queryMetricsWithExpressions();
  }

  async function queryMetricsWithExpressions() {
    const { expressions, metricConfig, i } = dashboardStore.selectedGrid;
    if (!(expressions && expressions[0])) {
      return emit("update", {});
    }

    const metrics: Indexable = (await useDashboardQueryProcessor([{ ...states, metricConfig, id: i }])) || {};
    const params = metrics[i];
    states.tips = params.tips || [];
    states.metricTypes = params.typesOfMQE || [];
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      typesOfMQE: states.metricTypes,
    });
    emit("update", params.source || {});
    if (states.isTopList) {
      const values: any = Object.values(params.source)[0];
      if (!values) {
        return;
      }
      states.dashboardList = states.dashboardList.filter((d) => d.entity === values[0].owner.scope);
    }
  }

  function changeValueDashboard(opt: { value: string }[]) {
    if (!opt[0]) {
      states.valueRelatedDashboard = "";
    } else {
      states.valueRelatedDashboard = opt[0].value;
    }
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      valueRelatedDashboard: states.valueRelatedDashboard,
    });
  }

  function changeDashboard(opt: { value: string }[]) {
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
    if (states.isList) {
      states.subMetrics.push("");
      states.subTips.push("");
    }

    if (!states.isList) {
      states.metricTypes.push(states.metricTypes[0]);
      return;
    }
    states.metricTypes.push("");
  }
  function deleteMetric(index: number) {
    if (states.metrics.length === 1) {
      states.metrics = [""];
      states.metricTypes = [""];
      states.tips = [""];
      let v: any = { typesOfMQE: states.metricTypes, expressions: states.metrics };
      if (states.isList) {
        states.subMetrics = [""];
        states.subMetricTypes = [""];
        states.subTips = [""];
        v = {
          ...v,
          subTypesOfMQE: states.subMetricTypes,
          subExpressions: states.subMetrics,
        };
      }
      dashboardStore.selectWidget({
        ...dashboardStore.selectedGrid,
        ...v,
        metricConfig: [],
      });
      return;
    }
    states.metrics.splice(index, 1);
    states.metricTypes.splice(index, 1);
    states.tips.splice(index, 1);
    const config = dashboardStore.selectedGrid.metricConfig || [];
    const metricConfig = config[index] ? config.splice(index, 1) : config;
    let p = {};
    if (states.isList) {
      states.subMetrics.splice(index, 1);
      states.subMetricTypes.splice(index, 1);
      states.subTips.splice(index, 1);
      p = {
        ...p,
        typesOfMQE: states.metricTypes,
        expressions: states.metrics,
        subTypesOfMQE: states.subMetricTypes,
        subExpressions: states.subMetrics,
      };
    }
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      ...p,
      metricConfig,
    });
    queryMetrics();
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
  async function changeExpression(event: any, index: number) {
    const params = (event.target.textContent || "").replace(/\s+/g, "");

    states.metrics[index] = params;
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      expressions: states.metrics,
    });
    if (params) {
      await queryMetrics();
    }
  }
  async function changeSubExpression(event: any, index: number) {
    const params = (event.target.textContent || "").replace(/\s+/g, "");

    states.subMetrics[index] = params;
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      subExpressions: states.subMetrics,
      subTypesOfMQE: states.subMetricTypes,
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
    width: 400px;
    margin-right: 10px;
  }

  .metric-item {
    margin-bottom: 10px;
  }

  .chart-types {
    span {
      display: inline-block;
      padding: 2px 10px;
      border: 1px solid $disabled-color;
      background-color: $theme-background;
      border-right: 0;
      cursor: pointer;
    }

    span:nth-last-child(1) {
      border-right: 1px solid $disabled-color;
    }
  }

  span.active {
    background-color: $active-color;
    color: $theme-background;
  }

  .expression-param {
    display: inline-block;
    width: 400px;
    border: 1px solid $border-color;
    cursor: text;
    padding: 0 5px;
    border-radius: 3px;
    outline: none;
    margin-right: 5px;
    min-height: 26px;

    &:focus {
      border-color: $active-color;
    }
  }

  .title {
    display: inline-block;
    width: 410px;
  }

  .link {
    cursor: pointer;
    color: $active-color;
    padding-left: 2px;
  }
</style>
