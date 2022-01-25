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
        placeholder="Please input service name"
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
    <el-table v-loading="chartLoading" :data="services" style="width: 100%">
      <el-table-column label="Services">
        <template #default="scope">
          <router-link
            class="link"
            :to="`/dashboard/${dashboardStore.layerId}/${EntityType[0].value}/${scope.row.id}/${config.dashboardName}`"
            :key="1"
            :style="{ fontSize: `${config.fontSize}px` }"
          >
            {{ scope.row.label }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        v-for="(metric, index) in config.metrics"
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
      :total="selectorStore.services.length"
      @current-change="changePage"
      @prev-click="changePage"
      @next-click="changePage"
    />
  </div>
</template>
<script setup lang="ts">
import { watch, ref } from "vue";
import { ElMessage } from "element-plus";
import type { PropType } from "vue";
import { ServiceListConfig } from "@/types/dashboard";
import Line from "./Line.vue";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";
import { Service } from "@/types/selector";
import { useQueryPodsMetrics, usePodsSource } from "@/hooks/useProcessor";
import { EntityType } from "../data";

/*global defineProps */
const props = defineProps({
  data: {
    type: Object,
  },
  config: {
    type: Object as PropType<
      ServiceListConfig & {
        i: string;
        metrics: string[];
        metricTypes: string[];
      }
    >,
    default: () => ({ dashboardName: "", fontSize: 12 }),
  },
  intervalTime: { type: Array as PropType<string[]>, default: () => [] },
});
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const chartLoading = ref<boolean>(false);
const pageSize = 5;
const services = ref<Service[]>([]);
const searchServices = ref<Service[]>([]);
const searchText = ref<string>("");

queryServices();

async function queryServices() {
  chartLoading.value = true;
  const resp = await selectorStore.fetchServices(dashboardStore.layerId);

  chartLoading.value = false;
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
  services.value = selectorStore.services.splice(0, pageSize);
  queryServiceMetrics(services.value);
}
async function queryServiceMetrics(currentServices: Service[]) {
  const { metrics } = props.config;

  if (metrics.length && metrics[0]) {
    const params = await useQueryPodsMetrics(
      currentServices,
      dashboardStore.selectedGrid,
      EntityType[0].value
    );
    const json = await dashboardStore.fetchMetricValue(params);

    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    services.value = usePodsSource(
      currentServices,
      json,
      dashboardStore.selectedGrid
    );
    return;
  }
  services.value = currentServices;
}
function changePage(pageIndex: number) {
  services.value = selectorStore.services.splice(pageIndex - 1, pageSize);
}
function searchList() {
  searchServices.value = selectorStore.services.filter((d: { label: string }) =>
    d.label.includes(searchText.value)
  );
  services.value = searchServices.value.splice(0, pageSize);
}
watch(
  () => [props.config.metricTypes, props.config.metrics],
  () => {
    if (dashboardStore.showConfig) {
      queryServiceMetrics(services.value);
    }
  }
);
</script>
<style lang="scss" scoped>
@import "./style.scss";

.chart {
  height: 39px;
}
</style>
