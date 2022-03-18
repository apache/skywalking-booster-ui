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
  <div class="list">
    <div class="search">
      <el-input
        v-model="searchText"
        placeholder="Please input service name"
        size="small"
        @change="searchList"
        class="inputs mt-5"
      >
        <template #append>
          <el-button size="small" @click="searchList">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="table">
      <el-table
        v-loading="chartLoading"
        :data="services"
        style="width: 100%"
        :span-method="objectSpanMethod"
        :border="true"
        :style="{ fontSize: '14px' }"
      >
        <el-table-column label="Service Groups" v-if="config.showGroup">
          <template #default="scope">
            {{ scope.row.group }}
          </template>
        </el-table-column>
        <el-table-column label="Service Names">
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
import Card from "./Card.vue";
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
const groups = ref<any>({});

queryServices();

async function queryServices() {
  chartLoading.value = true;
  const resp = await selectorStore.fetchServices(dashboardStore.layerId);

  chartLoading.value = false;
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
  const map: { [key: string]: any[] } = selectorStore.services.reduce(
    (result: { [key: string]: any[] }, item: any) => {
      item.group = item.group || "";
      if (result[item.group]) {
        item.merge = true;
      } else {
        item.merge = false;
        result[item.group] = [];
      }
      result[item.group].push(item);
      return result;
    },
    {}
  );
  services.value = Object.values(map).flat(1).splice(0, pageSize);
  const obj = {} as any;
  for (const s of services.value) {
    s.group = s.group || "";
    if (!obj[s.group]) {
      obj[s.group] = 1;
    } else {
      obj[s.group]++;
    }
    groups.value[s.group] = obj[s.group];
  }

  queryServiceMetrics(services.value);
}
async function queryServiceMetrics(currentServices: Service[]) {
  const { metrics } = props.config;

  if (metrics.length && metrics[0]) {
    const params = await useQueryPodsMetrics(
      currentServices,
      props.config,
      EntityType[0].value
    );
    const json = await dashboardStore.fetchMetricValue(params);

    if (json.errors) {
      ElMessage.error(json.errors);
      return;
    }
    services.value = usePodsSource(currentServices, json, props.config);
    return;
  }
  services.value = currentServices;
}
function objectSpanMethod(param: any): any {
  if (!props.config.showGroup) {
    return;
  }
  if (param.columnIndex !== 0) {
    return;
  }
  if (param.row.merge) {
    return {
      rowspan: 0,
      colspan: 0,
    };
  } else {
    return { rowspan: groups.value[param.row.group], colspan: 1 };
  }
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

.inputs {
  width: 300px;
}

.table {
  margin: 10px 0;
}
</style>
