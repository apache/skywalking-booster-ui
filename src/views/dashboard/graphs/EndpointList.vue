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
      <el-input
        v-model="searchText"
        placeholder="Please input endpoint name"
        class="input-with-search"
        size="small"
        @change="searchList"
      >
        <template #append>
          <el-button size="small" @click="searchList">
            <Icon size="lg" iconName="search" />
          </el-button>
        </template>
      </el-input>
    </div>
    <el-table v-loading="chartLoading" :data="endpoints" style="width: 100%">
      <el-table-column label="Endpoints">
        <template #default="scope">
          <router-link
            class="link"
            :to="`/dashboard/${dashboardStore.layerId}/${EntityType[2].value}/${selectorStore.currentService.id}/${scope.row.id}/${config.dashboardName}`"
            :style="{ fontSize: `${config.fontSize}px` }"
          >
            {{ scope.row.label }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(metric, index) in dashboardStore.selectedGrid.metrics"
        :label="metric"
        :key="metric + index"
      >
        <template #default="scope">
          <div class="chart">
            <Line
              :data="{ metric: scope.row[metric] }"
              :intervalTime="intervalTime"
              :config="{ showXAxis: false, showYAxis: false }"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next"
      :page-size="pageSize"
      :total="selectorStore.pods.length"
      @current-change="changePage"
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
import { EndpointListConfig } from "@/types/dashboard";
import { Endpoint } from "@/types/selector";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useQueryPodsMetrics, usePodsSource } from "@/hooks/useProcessor";
import Line from "./Line.vue";
import { EntityType } from "../data";

/*global defineProps */
defineProps({
  data: {
    type: Object,
  },
  config: {
    type: Object as PropType<EndpointListConfig>,
    default: () => ({ dashboardName: "", fontSize: 12 }),
  },
  intervalTime: { type: Array as PropType<string[]>, default: () => [] },
});
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const chartLoading = ref<boolean>(false);
const endpoints = ref<Endpoint[]>([]);
const searchEndpoints = ref<Endpoint[]>([]);
const pageSize = 5;
const searchText = ref<string>("");

queryEndpoints();

async function queryEndpoints() {
  chartLoading.value = true;
  const resp = await selectorStore.getEndpoints();

  chartLoading.value = false;
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  searchEndpoints.value = selectorStore.pods;
  endpoints.value = selectorStore.pods.splice(0, pageSize);
  queryEndpointMetrics(endpoints.value);
}
async function queryEndpointMetrics(currentPods: Endpoint[]) {
  const { metrics } = dashboardStore.selectedGrid;

  if (metrics.length && metrics[0]) {
    const params = await useQueryPodsMetrics(
      currentPods,
      dashboardStore.selectedGrid,
      EntityType[2].value
    );
    const json = await dashboardStore.fetchMetricValue(params);

    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    endpoints.value = usePodsSource(
      currentPods,
      json,
      dashboardStore.selectedGrid
    );
    return;
  }
  endpoints.value = currentPods;
}
function changePage(pageIndex: number) {
  endpoints.value = searchEndpoints.value.splice(pageIndex - 1, pageSize);
}
function searchList() {
  const currentEndpoints = selectorStore.pods.filter((d: { label: string }) =>
    d.label.includes(searchText.value)
  );
  searchEndpoints.value = currentEndpoints;
  endpoints.value = currentEndpoints.splice(0, pageSize);
}
watch(
  () => [
    dashboardStore.selectedGrid.metricTypes,
    dashboardStore.selectedGrid.metrics,
  ],
  () => {
    queryEndpointMetrics(endpoints.value);
  }
);
</script>
<style lang="scss" scoped>
@import "./style.scss";

.chart {
  height: 39px;
}
</style>
