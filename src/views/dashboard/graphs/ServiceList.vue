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
      <el-input v-model="searchText" placeholder="Please input service name" @change="searchList" class="inputs mt-5">
        <template #append>
          <el-button @click="searchList">
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
        <el-table-column fixed label="Service Groups" v-if="config.showGroup" min-width="150">
          <template #default="scope">
            {{ scope.row.group }}
          </template>
        </el-table-column>
        <el-table-column fixed label="Service Names" min-width="220">
          <template #default="scope">
            <span class="link" :style="{ fontSize: `${config.fontSize}px` }" @click="clickService(scope)">
              {{ scope.row.shortName }}
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
      :total="searchText ? sortServices.filter((d: any) => d.label.includes(searchText)).length : sortServices.length"
      @current-change="handleCurrentChange"
      @prev-click="changePage"
      @next-click="changePage"
    />
  </div>
</template>
<script setup lang="ts">
  import { watch, ref } from "vue";
  import { ElMessage } from "element-plus";
  import type { PropType } from "vue";
  import type { ServiceListConfig } from "@/types/dashboard";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import type { Service } from "@/types/selector";
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
        ServiceListConfig & {
          i: string;
          isEdit: boolean;
          names: string[];
          metricConfig: MetricConfigOpt[];
          expressions: string[];
          typesOfMQE: string[];
          subExpressions: string[];
          subTypesOfMQE: string[];
        }
      >,
      default: () => ({ dashboardName: "", fontSize: 12 }),
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
    isEdit: { type: Boolean, default: false },
  });
  const emit = defineEmits(["expressionTips"]);
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const appStore = useAppStoreWithOut();
  const chartLoading = ref<boolean>(false);
  const currentPage = ref<number>(1);
  const pageSize = 10;
  const services = ref<Service[]>([]);
  const colMetrics = ref<string[]>([]);
  const colSubMetrics = ref<string[]>([]);
  const searchText = ref<string>("");
  const groups = ref<any>({});
  const sortServices = ref<(Service & { merge: boolean })[]>([]);
  const metricConfig = ref<MetricConfigOpt[]>(props.config.metricConfig || []);
  const typesOfMQE = ref<string[]>(props.config.typesOfMQE || []);

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
    const s = sortServices.value.filter((d: Service, index: number) => index < pageSize);
    setServices(s);
  }

  function setServices(arr: (Service & { merge: boolean })[]) {
    groups.value = {};
    const map: { [key: string]: any[] } = arr.reduce((result: { [key: string]: any[] }, item: any) => {
      item.group = item.group || "";
      if (result[item.group]) {
        item.merge = true;
      } else {
        item.merge = false;
        result[item.group] = [];
      }
      result[item.group].push(item);
      return result;
    }, {});
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
  async function queryServiceMetrics(arr: Service[]) {
    if (!arr.length) {
      return;
    }
    const currentServices = arr.map((d: Service) => {
      return {
        id: d.id,
        value: d.value,
        label: d.label,
        layers: d.layers,
        group: d.group,
        normal: d.normal,
        merge: d.merge,
        shortName: d.shortName,
      };
    });
    queryServiceExpressions(currentServices);
  }
  async function queryServiceExpressions(currentServices: Service[]) {
    const expressions = props.config.expressions || [];
    const subExpressions = props.config.subExpressions || [];

    if (expressions.length && expressions[0]) {
      const params = await useExpressionsQueryPodsMetrics(
        currentServices,
        { metricConfig: metricConfig.value || [], expressions, subExpressions },
        EntityType[0].value,
      );
      services.value = params.data;
      colMetrics.value = params.names;
      colSubMetrics.value = params.subNames;
      metricConfig.value = params.metricConfigArr;
      typesOfMQE.value = params.metricTypesArr;
      emit("expressionTips", { tips: params.expressionsTips, subTips: params.subExpressionsTips });
      return;
    }
    services.value = currentServices;
    colMetrics.value = [];
    colSubMetrics.value = [];
    metricConfig.value = [];
    typesOfMQE.value = [];
    emit("expressionTips", [], []);
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
  function changePage() {
    let services = sortServices.value;
    if (searchText.value) {
      services = sortServices.value.filter((d: { label: string }) => d.label.includes(searchText.value));
    }
    const arr = services.filter((d: Service, index: number) => {
      if (index >= (currentPage.value - 1) * pageSize && index < pageSize * currentPage.value) {
        return d;
      }
    });

    setServices(arr);
  }
  function handleCurrentChange(val: number) {
    currentPage.value = val;
    changePage();
  }
  function searchList() {
    const searchServices = sortServices.value.filter((d: { label: string }) => d.label.includes(searchText.value));
    const services = searchServices.filter((_, index: number) => index < pageSize);
    setServices(services);
    currentPage.value = 1;
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
      queryServiceMetrics(services.value);
    },
  );

  watch(
    () => appStore.durationTime,
    () => {
      if (dashboardStore.entity === EntityType[1].value) {
        queryServices();
      }
    },
  );
</script>
<style lang="scss" scoped>
  @import url("./style.scss");

  .link {
    color: $active-color;
  }
</style>
