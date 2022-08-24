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
    <div class="list">
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
            <span
              class="link"
              :style="{ fontSize: `${config.fontSize}px` }"
              @click="clickService(scope)"
            >
              {{ scope.row.label }}
            </span>
          </template>
        </el-table-column>
        <ColumnGraph
          :intervalTime="intervalTime"
          :colMetrics="colMetrics"
          :config="config"
          v-if="colMetrics.length"
        />
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
import { watch, ref, computed } from "vue";
import { ElMessage } from "element-plus";
import type { PropType } from "vue";
import { ServiceListConfig } from "@/types/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { Service } from "@/types/selector";
import { useQueryPodsMetrics, usePodsSource } from "@/hooks/useProcessor";
import { EntityType } from "../data";
import router from "@/router";
import getDashboard from "@/hooks/useDashboardsSession";
import { MetricConfigOpt } from "@/types/dashboard";
import ColumnGraph from "./components/ColumnGraph.vue";

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
        isEdit: boolean;
      } & { metricConfig: MetricConfigOpt[] }
    >,
    default: () => ({ dashboardName: "", fontSize: 12 }),
  },
  intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  isEdit: { type: Boolean, default: false },
});
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const appStore = useAppStoreWithOut();
const chartLoading = ref<boolean>(false);
const pageSize = 10;
const services = ref<Service[]>([]);
const searchText = ref<string>("");
const groups = ref<any>({});
const sortServices = ref<(Service & { merge: boolean })[]>([]);
const colMetrics = computed(() =>
  (props.config.metrics || []).filter((d: string) => d)
);
queryServices();

async function queryServices() {
  chartLoading.value = true;
  const resp = await selectorStore.fetchServices(dashboardStore.layerId);

  chartLoading.value = false;
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
  sortServices.value = selectorStore.services.sort((a: any, b: any) => {
    const groupA = a.group.toUpperCase();
    const groupB = b.group.toUpperCase();
    if (groupA < groupB) {
      return -1;
    }
    if (groupA > groupB) {
      return 1;
    }
    return 0;
  });
  const s = sortServices.value.filter(
    (d: Service, index: number) => index < pageSize
  );
  setServices(s);
}

function setServices(arr: (Service & { merge: boolean })[]) {
  groups.value = {};
  const map: { [key: string]: any[] } = arr.reduce(
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
  const list = Object.values(map).flat(1);
  const obj = {} as any;
  for (const s of list) {
    s.group = s.group || "";
    if (!obj[s.group]) {
      obj[s.group] = 1;
    } else {
      obj[s.group]++;
    }
    groups.value[s.group] = obj[s.group];
  }
  services.value = list;
  queryServiceMetrics(services.value);
}

function clickService(scope: any) {
  const { dashboard } = getDashboard({
    name: props.config.dashboardName,
    layer: dashboardStore.layerId,
    entity: EntityType[0].value,
  });
  if (!dashboard) {
    ElMessage.error("No this dashboard");
    return;
  }
  const path = `/dashboard/${dashboard.layer}/${dashboard.entity}/${scope.row.id}/${dashboard.name}`;

  router.push(path);
}
async function queryServiceMetrics(currentServices: Service[]) {
  if (!currentServices.length) {
    return;
  }
  const metrics = props.config.metrics || [];
  const metricTypes = props.config.metricTypes || [];

  if (metrics.length && metrics[0] && metricTypes.length && metricTypes[0]) {
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
    const metricConfig = props.config.metricConfig || [];
    services.value = usePodsSource(currentServices, json, {
      ...props.config,
      metricConfig: metricConfig || [],
    });
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
  }
  return { rowspan: groups.value[param.row.group], colspan: 1 };
}
function changePage(pageIndex: number) {
  const arr = sortServices.value.filter((d: Service, index: number) => {
    if (index >= (pageIndex - 1) * pageSize && index < pageSize * pageIndex) {
      return d;
    }
  });

  setServices(arr);
}
function searchList() {
  const searchServices = sortServices.value.filter((d: { label: string }) =>
    d.label.includes(searchText.value)
  );
  const services = searchServices.filter(
    (d: unknown, index: number) => index < pageSize
  );
  setServices(services);
}

watch(
  () => [...(props.config.metricTypes || []), ...(props.config.metrics || [])],
  (data, old) => {
    if (JSON.stringify(data) === JSON.stringify(old)) {
      return;
    }
    queryServiceMetrics(services.value);
  }
);
watch(
  () => [...(props.config.metricConfig || [])],
  (data, old) => {
    if (JSON.stringify(data) === JSON.stringify(old)) {
      return;
    }
    queryServiceMetrics(services.value);
  }
);
watch(
  () => appStore.durationTime,
  () => {
    if (dashboardStore.entity === EntityType[1].value) {
      queryServices();
    }
  }
);
</script>
<style lang="scss" scoped>
@import "./style.scss";

.inputs {
  width: 300px;
}
</style>
