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
        placeholder="Please input instance name"
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
    <el-table v-loading="chartLoading" :data="instances" style="width: 100%">
      <el-table-column label="Service Instances">
        <template #default="scope">
          <router-link
            class="link"
            :to="`/dashboard/${dashboardStore.layerId}/${EntityType[3].value}/${selectorStore.currentService.id}/${scope.row.id}/${config.dashboardName}`"
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
              v-if="config.metricTypes[index] === 'readMetricsValues'"
              :data="{ metric: scope.row[metric] }"
              :intervalTime="intervalTime"
              :config="{ showXAxis: false, showYAxis: false }"
            />
            <Card
              v-else
              :data="{ metric: scope.row[metric] }"
              :config="{ textAlign: 'left' }"
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
      :total="searchInstances.length"
      @current-change="changePage"
      @prev-click="changePage"
      @next-click="changePage"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { PropType } from "vue";
import Line from "./Line.vue";
import Card from "./Card.vue";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";
import { InstanceListConfig } from "@/types/dashboard";
import { Instance } from "@/types/selector";
import { useQueryPodsMetrics, usePodsSource } from "@/hooks/useProcessor";
import { EntityType } from "../data";

/*global defineProps */
const props = defineProps({
  config: {
    type: Object as PropType<
      InstanceListConfig & {
        i: string;
        metrics: string[];
        metricTypes: string[];
      }
    >,
    default: () => ({
      dashboardName: "",
      fontSize: 12,
      i: "",
      metrics: [],
      metricTypes: [],
    }),
  },
  intervalTime: { type: Array as PropType<string[]>, default: () => [] },
});
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const chartLoading = ref<boolean>(false);
const instances = ref<Instance[]>([]); // current instances
const searchInstances = ref<Instance[]>([]); // all instances
const pageSize = 5;
const searchText = ref<string>("");

queryInstance();

async function queryInstance() {
  chartLoading.value = true;
  const resp = await selectorStore.getServiceInstances();

  chartLoading.value = false;
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  searchInstances.value = selectorStore.pods;
}

async function queryInstanceMetrics(currentInstances: Instance[]) {
  const { metrics } = props.config;

  if (metrics.length && metrics[0]) {
    const params = await useQueryPodsMetrics(
      currentInstances,
      dashboardStore.selectedGrid,
      EntityType[3].value
    );
    const json = await dashboardStore.fetchMetricValue(params);

    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    instances.value = usePodsSource(
      currentInstances,
      json,
      dashboardStore.selectedGrid
    );
    return;
  }
  instances.value = currentInstances;
}

function changePage(pageIndex: number) {
  instances.value = searchInstances.value.splice(pageIndex - 1, pageSize);
}
function searchList() {
  searchInstances.value = selectorStore.pods.filter((d: { label: string }) =>
    d.label.includes(searchText.value)
  );
  instances.value = searchInstances.value.splice(0, pageSize);
}

watch(
  () => [props.config.metricTypes, props.config.metrics],
  () => {
    if (dashboardStore.selectedGrid.i === props.config.i) {
      const currentInstances = searchInstances.value.splice(0, pageSize);
      queryInstanceMetrics(currentInstances);
    }
  }
);
</script>
<style lang="scss" scoped>
@import "./style.scss";

.chart {
  height: 40px;
}
</style>
