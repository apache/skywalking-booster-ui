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
      <el-table v-loading="chartLoading" :data="instances" style="width: 100%">
        <el-table-column label="Service Instances">
          <template #default="scope">
            <span
              class="link"
              @click="clickInstance(scope)"
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
                :data="metric ? { [metric]: scope.row[metric] } : {}"
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
        <el-table-column label="Attributes" :width="100">
          <template #default="scope">
            <el-popover placement="left" :width="400" trigger="click">
              <template #reference>
                <span class="link">{{ t("viewAttributes") }}</span>
              </template>
              <div class="attributes" v-if="scope.row.attributes.length">
                <div
                  v-for="(attr, index) in scope.row.attributes"
                  :key="attr.name + index"
                  :style="{ fontSize: `${config.fontSize}px` }"
                  class="mt-5"
                >
                  {{ attr.name }}: {{ attr.value || null }}
                </div>
              </div>
            </el-popover>
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
      :total="searchInstances.length"
      @current-change="changePage"
      @prev-click="changePage"
      @next-click="changePage"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
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
import router from "@/router";
import getDashboard from "@/hooks/useDashboardsSession";
import { MetricConfigOpt } from "@/types/dashboard";

/*global defineProps */
const props = defineProps({
  config: {
    type: Object as PropType<
      InstanceListConfig & {
        i: string;
        metrics: string[];
        metricTypes: string[];
        isEdit: boolean;
      } & { metricConfig: MetricConfigOpt[] }
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
  needQuery: { type: Boolean, default: false },
  isEdit: { type: Boolean, default: false },
});
const { t } = useI18n();
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const chartLoading = ref<boolean>(false);
const instances = ref<Instance[]>([]); // current instances
const searchInstances = ref<Instance[]>([]); // all instances
const pageSize = 15;
const searchText = ref<string>("");

queryInstance();
async function queryInstance() {
  chartLoading.value = true;
  const resp = await selectorStore.getServiceInstances();

  chartLoading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
    searchInstances.value = [];
    instances.value = [];
    return;
  }
  searchInstances.value = selectorStore.pods;
  instances.value = searchInstances.value.splice(0, pageSize);
  queryInstanceMetrics(instances.value);
}

async function queryInstanceMetrics(currentInstances: Instance[]) {
  if (!currentInstances.length) {
    return;
  }
  const { metrics } = props.config;

  if (metrics.length && metrics[0]) {
    const params = await useQueryPodsMetrics(
      currentInstances,
      props.config,
      EntityType[3].value
    );
    const json = await dashboardStore.fetchMetricValue(params);

    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    const metricConfig = props.config.metricConfig || [];
    instances.value = usePodsSource(currentInstances, json, {
      ...props.config,
      metricConfig,
    });
    return;
  }
  instances.value = currentInstances;
}

function clickInstance(scope: any) {
  const d = getDashboard({
    name: props.config.dashboardName,
    layer: dashboardStore.layerId,
    entity: EntityType[3].value,
  });
  if (!d) {
    ElMessage.error("No this dashboard");
    return;
  }
  router.push(
    `/dashboard/${d.layer}/${d.entity}/${selectorStore.currentService.id}/${
      scope.row.id
    }/${d.name.split(" ").join("-")}`
  );
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
  () => {
    queryInstanceMetrics(instances.value);
  }
);
watch(
  () => selectorStore.currentService,
  () => {
    queryInstance();
  }
);
</script>
<style lang="scss" scoped>
@import "./style.scss";

.chart {
  height: 40px;
}

.inputs {
  width: 300px;
}

.attributes {
  max-height: 400px;
  overflow: auto;
}
</style>
