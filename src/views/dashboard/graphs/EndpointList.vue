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
        <template #prepend>
          <Selector style="width: 120px" v-model="topN" :options="topNList" placeholder="Select" />
        </template>
        <template #append>
          <el-button @click="searchList">
            <Icon size="middle" iconName="search" />
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="list">
      <el-table v-loading="chartLoading" :data="currentEndpoints" style="width: 100%">
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
            typesOfMQE,
          }"
          v-if="colMetrics.length"
        />
      </el-table>
    </div>
    <el-pagination
      class="pagination flex-h"
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="endpoints.length"
      @current-change="handleCurrentChange"
      @prev-click="changePage"
      @next-click="changePage"
    />
  </div>
</template>
<script setup lang="ts">
  import { ref, watch } from "vue";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import type { PropType } from "vue";
  import type { EndpointListConfig } from "@/types/dashboard";
  import type { Endpoint } from "@/types/selector";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useExpressionsQueryPodsMetrics } from "@/hooks/useExpressionsProcessor";
  import { EntityType } from "../data";
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
          expressions: string[];
          typesOfMQE: string[];
          subExpressions: string[];
          subTypesOfMQE: string[];
        } & { metricConfig: MetricConfigOpt[] }
      >,
      default: () => ({
        dashboardName: "",
        fontSize: 12,
        i: "",
      }),
    },
    needQuery: { type: Boolean, default: false },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  });

  const emit = defineEmits(["expressionTips"]);
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const chartLoading = ref<boolean>(false);
  const endpoints = ref<Endpoint[]>([]); // all of endpoints
  const currentEndpoints = ref<Endpoint[]>([]); // current page of endpoints
  const searchText = ref<string>("");
  const colMetrics = ref<string[]>([]);
  const colSubMetrics = ref<string[]>([]);
  const metricConfig = ref<MetricConfigOpt[]>(props.config.metricConfig || []);
  const typesOfMQE = ref<string[]>(props.config.typesOfMQE || []);
  const topN = ref<number>(20);
  const currentPage = ref<number>(1);
  const pageSize = 10;
  const topNList = [
    { label: "TopN20", value: 20 },
    { label: "TopN50", value: 50 },
    { label: "TopN100", value: 100 },
    { label: "TopN150", value: 150 },
    { label: "TopN200", value: 200 },
  ];

  if (props.needQuery) {
    queryEndpoints();
  }
  async function queryEndpoints() {
    chartLoading.value = true;
    const resp = await selectorStore.getEndpoints({
      keyword: searchText.value,
      limit: topN.value,
    });

    chartLoading.value = false;
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    endpoints.value = resp.data.pods || [];
    currentEndpoints.value = endpoints.value.filter((d: unknown, index: number) => index < pageSize);
    queryEndpointMetrics(currentEndpoints.value);
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
    queryEndpointExpressions(currentPods);
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
      currentEndpoints.value = params.data;
      colMetrics.value = params.names;
      colSubMetrics.value = params.subNames;
      metricConfig.value = params.metricConfigArr;
      typesOfMQE.value = params.metricTypesArr;
      emit("expressionTips", { tips: params.expressionsTips, subTips: params.subExpressionsTips });

      return;
    }
    currentEndpoints.value = currentPods;
    colMetrics.value = [];
    colSubMetrics.value = [];
    metricConfig.value = [];
    typesOfMQE.value = [];
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
  function changePage() {
    currentEndpoints.value = endpoints.value.filter(
      (_, index: number) => index >= (currentPage.value - 1) * pageSize && index < currentPage.value * pageSize,
    );
    queryEndpointMetrics(currentEndpoints.value);
  }
  function handleCurrentChange(val: number) {
    currentPage.value = val;
    changePage();
  }
  watch(
    () => [
      ...(props.config.metricConfig || []),
      ...(props.config.expressions || []),
      ...(props.config.subExpressions || []),
    ],
    (data, old) => {
      if (JSON.stringify(data) === JSON.stringify(old)) {
        return;
      }
      metricConfig.value = props.config.metricConfig;
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
