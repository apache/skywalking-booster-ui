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
  <div class="table">
    <div class="search">
      <el-input v-model="searchText" placeholder="Search for more endpoints" @change="searchList" class="inputs">
        <template #append>
          <el-button @click="searchList">
            <Icon size="middle" iconName="search" />
          </el-button>
        </template>
      </el-input>
      <span class="ml-5 tips">{{ t("endpointTips") }}</span>
    </div>
    <div class="list">
      <el-table v-loading="chartLoading" :data="endpoints" style="width: 100%">
        <el-table-column label="Endpoints" fixed min-width="220">
          <template #default="scope">
            <span class="link" @click="clickEndpoint(scope)" :style="{ fontSize: `${config.fontSize}px` }">
              {{ scope.row.label }}
            </span>
          </template>
        </el-table-column>
        <ColumnGraph
          :intervalTime="intervalTime"
          :colMetrics="colMetrics"
          :colSubMetrics="colSubMetrics"
          :config="{
            ...config,
            metricConfig,
            metricTypes,
            metricMode,
          }"
          v-if="colMetrics.length"
        />
      </el-table>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch } from "vue";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import { useI18n } from "vue-i18n";
  import type { PropType } from "vue";
  import type { EndpointListConfig } from "@/types/dashboard";
  import type { Endpoint } from "@/types/selector";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useQueryPodsMetrics, usePodsSource } from "@/hooks/useMetricsProcessor";
  import { useExpressionsQueryPodsMetrics } from "@/hooks/useExpressionsProcessor";
  import { EntityType, MetricModes } from "../data";
  import router from "@/router";
  import getDashboard from "@/hooks/useDashboardsSession";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import ColumnGraph from "./components/ColumnGraph.vue";

  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object,
    },
    config: {
      type: Object as PropType<
        EndpointListConfig & {
          i: string;
          metrics: string[];
          metricTypes: string[];
          metricMode: string;
          expressions: string[];
          typesOfMQE: string[];
          subExpressions: string[];
          subTypesOfMQE: string[];
        } & { metricConfig: MetricConfigOpt[] }
      >,
      default: () => ({
        metrics: [],
        metricTypes: [],
        dashboardName: "",
        fontSize: 12,
        i: "",
      }),
    },
    needQuery: { type: Boolean, default: false },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  });

  const emit = defineEmits(["expressionTips"]);
  const { t } = useI18n();
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const chartLoading = ref<boolean>(false);
  const endpoints = ref<Endpoint[]>([]);
  const searchText = ref<string>("");
  const colMetrics = ref<string[]>([]);
  const colSubMetrics = ref<string[]>([]);
  const metricConfig = ref<MetricConfigOpt[]>(props.config.metricConfig || []);
  const metricTypes = ref<string[]>(props.config.metricTypes || []);
  const metricMode = ref<string>(props.config.metricMode);

  if (props.needQuery) {
    queryEndpoints();
  }
  async function queryEndpoints() {
    chartLoading.value = true;
    const resp = await selectorStore.getEndpoints({
      keyword: searchText.value,
    });

    chartLoading.value = false;
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    endpoints.value = resp.data.pods || [];
    queryEndpointMetrics(endpoints.value);
  }
  async function queryEndpointMetrics(arr: Endpoint[]) {
    if (!arr.length) {
      return;
    }
    const currentPods = arr.map((d: Endpoint) => {
      return {
        id: d.id,
        value: d.value,
        label: d.label,
        merge: d.merge,
      };
    });
    if (props.config.metricMode === MetricModes.Expression) {
      queryEndpointExpressions(currentPods);
      return;
    }
    const metrics = props.config.metrics || [];
    const types = props.config.metricTypes || [];
    if (metrics.length && metrics[0] && types.length && types[0]) {
      const params = await useQueryPodsMetrics(currentPods, props.config, EntityType[2].value);
      const json = await dashboardStore.fetchMetricValue(params);

      if (json.errors) {
        ElMessage.error(json.errors);
        return;
      }
      const { data, names, metricConfigArr, metricTypesArr } = usePodsSource(currentPods, json, {
        ...props.config,
        metricConfig: metricConfig.value,
      });
      endpoints.value = data;
      colMetrics.value = names;
      metricTypes.value = metricTypesArr;
      metricConfig.value = metricConfigArr;
      return;
    }
    endpoints.value = currentPods;
    colMetrics.value = [];
    metricTypes.value = [];
    metricConfig.value = [];
  }
  async function queryEndpointExpressions(currentPods: Endpoint[]) {
    const expressions = props.config.expressions || [];
    const subExpressions = props.config.subExpressions || [];

    if (expressions.length && expressions[0]) {
      const params = await useExpressionsQueryPodsMetrics(
        currentPods,
        { metricConfig: metricConfig.value || [], expressions, subExpressions },
        EntityType[2].value,
      );
      endpoints.value = params.data;
      colMetrics.value = params.names;
      colSubMetrics.value = params.subNames;
      metricTypes.value = params.metricTypesArr;
      metricConfig.value = params.metricConfigArr;
      emit("expressionTips", { tips: params.expressionsTips, subTips: params.subExpressionsTips });

      return;
    }
    endpoints.value = currentPods;
    colMetrics.value = [];
    colSubMetrics.value = [];
    metricTypes.value = [];
    metricConfig.value = [];
    emit("expressionTips", [], []);
  }
  function clickEndpoint(scope: any) {
    const { dashboard } = getDashboard({
      name: props.config.dashboardName,
      layer: dashboardStore.layerId,
      entity: EntityType[2].value,
    });
    if (!dashboard) {
      ElMessage.error("No this dashboard");
      return;
    }
    router.push(
      `/dashboard/${dashboard.layer}/${dashboard.entity}/${selectorStore.currentService.id}/${scope.row.id}/${dashboard.name}`,
    );
  }
  async function searchList() {
    await queryEndpoints();
  }
  watch(
    () => [
      ...(props.config.metricTypes || []),
      ...(props.config.metrics || []),
      ...(props.config.metricConfig || []),
      ...(props.config.expressions || []),
      ...(props.config.subExpressions || []),
      props.config.metricMode,
    ],
    (data, old) => {
      if (JSON.stringify(data) === JSON.stringify(old)) {
        return;
      }
      metricConfig.value = props.config.metricConfig;
      metricMode.value = props.config.metricMode;
      queryEndpointMetrics(endpoints.value);
    },
  );
  watch(
    () => selectorStore.currentService,
    () => {
      queryEndpoints();
    },
  );
</script>
<style lang="scss" scoped>
  @import url("./style.scss");

  .tips {
    color: rgb(255 0 0 / 50%);
  }

  .link {
    color: $active-color;
  }
</style>
