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
        size="small"
        @change="searchList"
        class="inputs"
      >
        <template #append>
          <el-button size="small" @click="searchList">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="list">
      <el-table v-loading="chartLoading" :data="endpoints" style="width: 100%">
        <el-table-column label="Endpoints">
          <template #default="scope">
            <span
              class="link"
              @click="clickEndpoint(scope)"
              :style="{ fontSize: `${config.fontSize}px` }"
            >
              {{ scope.row.label }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-for="(metric, index) in config.metrics"
          :label="`${metric} ${getUnit(index)}`"
          :key="metric + index"
        >
          <template #default="scope">
            <div class="chart">
              <Line
                v-if="config.metricTypes[index] === 'readMetricsValues'"
                :data="{ [metric]: scope.row[metric] }"
                :intervalTime="intervalTime"
                :config="{ showXAxis: false, showYAxis: false }"
              />
              <Card
                v-else
                :data="{ [metric]: scope.row[metric] }"
                :config="{ textAlign: 'left' }"
              />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="pagination"
      background
      small
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
import Card from "./Card.vue";
import { EntityType } from "../data";
import router from "@/router";
import getDashboard from "@/hooks/useDashboardsSession";
import { MetricConfigOpt } from "@/types/dashboard";

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
      } & { metricConfig: MetricConfigOpt[] }
    >,
    default: () => ({ dashboardName: "", fontSize: 12, i: "" }),
  },
  intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  isEdit: { type: Boolean, default: false },
});
// const emit = defineEmits(["changeOpt"]);
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const chartLoading = ref<boolean>(false);
const endpoints = ref<Endpoint[]>([]);
const pageSize = 15;
const total = 15;
const searchText = ref<string>("");

queryEndpoints(total);

async function queryEndpoints(limit?: number) {
  chartLoading.value = true;
  const resp = await selectorStore.getEndpoints({
    limit,
    keyword: searchText.value,
  });

  chartLoading.value = false;
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  endpoints.value = selectorStore.pods.splice(0, pageSize);
  await queryEndpointMetrics(endpoints.value);
}
async function queryEndpointMetrics(currentPods: Endpoint[]) {
  if (!currentPods.length) {
    return;
  }
  const metrics = props.config.metrics.filter((d: string) => d);

  if (metrics.length && metrics[0]) {
    const params = await useQueryPodsMetrics(
      currentPods,
      props.config,
      EntityType[2].value
    );
    const json = await dashboardStore.fetchMetricValue(params);

    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    const metricConfig = props.config.metricConfig || [];

    endpoints.value = usePodsSource(currentPods, json, {
      ...props.config,
      metricConfig: metricConfig,
    });
    return;
  }
  endpoints.value = currentPods;
}
function clickEndpoint(scope: any) {
  const d = getDashboard({
    name: props.config.dashboardName,
    layer: dashboardStore.layerId,
    entity: EntityType[2].value,
  });
  if (!d) {
    ElMessage.error("No this dashboard");
    return;
  }
  router.push(
    `/dashboard/${d.layer}/${d.entity}/${selectorStore.currentService.id}/${scope.row.id}/${d.name}`
  );
}
function changePage(pageIndex: number) {
  endpoints.value = selectorStore.pods.splice(
    (pageIndex - 1 || 0) * pageSize,
    pageSize * (pageIndex || 1)
  );
}
async function searchList() {
  const limit = searchText.value ? undefined : total;
  await queryEndpoints(limit);
}
function getUnit(index: number) {
  const u =
    (props.config.metricConfig &&
      props.config.metricConfig[index] &&
      props.config.metricConfig[index].unit) ||
    "";
  if (u) {
    return `(${u})`;
  }
  return u;
}
watch(
  () => [props.config.metricTypes, props.config.metrics],
  async () => {
    queryEndpointMetrics(endpoints.value);
    // emit("changeOpt", false);
  }
);
watch(
  () => selectorStore.currentService,
  () => {
    queryEndpoints(total);
  }
);
</script>
<style lang="scss" scoped>
@import "./style.scss";

.chart {
  height: 39px;
}

.inputs {
  width: 300px;
}
</style>
