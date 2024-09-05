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
      <el-input v-model="searchText" placeholder="Please input instance name" @change="searchList" class="inputs">
        <template #append>
          <el-button @click="searchList">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="list">
      <el-table v-loading="chartLoading" :data="instances" style="width: 100%">
        <el-table-column label="Service Instances" fixed min-width="320">
          <template #default="scope">
            <span class="link" @click="clickInstance(scope)" :style="{ fontSize: `${config.fontSize}px` }">
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
        <el-table-column label="Attributes" fixed="right" min-width="100">
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
      class="pagination flex-h"
      layout="prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="searchText ? pods.filter((d: any) => d.label.includes(searchText)).length : pods.length"
      @current-change="handleCurrentChange"
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
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { InstanceListConfig } from "@/types/dashboard";
  import type { Instance } from "@/types/selector";
  import { useExpressionsQueryPodsMetrics } from "@/hooks/useExpressionsProcessor";
  import { EntityType } from "../data";
  import router from "@/router";
  import getDashboard from "@/hooks/useDashboardsSession";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import ColumnGraph from "./components/ColumnGraph.vue";

  /*global defineProps */
  const props = defineProps({
    config: {
      type: Object as PropType<
        InstanceListConfig & {
          i: string;
          metrics: string[];
          isEdit: boolean;
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
        metrics: [],
        typesOfMQE: [],
      }),
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
    needQuery: { type: Boolean, default: false },
  });
  const emit = defineEmits(["expressionTips"]);
  const { t } = useI18n();
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const chartLoading = ref<boolean>(false);
  const instances = ref<Instance[]>([]); // current instances
  const currentPage = ref<number>(1);
  const pageSize = 10;
  const searchText = ref<string>("");
  const colMetrics = ref<string[]>([]);
  const colSubMetrics = ref<string[]>([]);
  const metricConfig = ref<MetricConfigOpt[]>(props.config.metricConfig || []);
  const pods = ref<Instance[]>([]); // all instances
  const typesOfMQE = ref<string[]>(props.config.typesOfMQE || []);

  if (props.needQuery) {
    queryInstance();
  }

  async function queryInstance() {
    chartLoading.value = true;
    const resp = await selectorStore.getServiceInstances();

    chartLoading.value = false;
    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
      instances.value = [];
      pods.value = [];
      return;
    }
    pods.value = resp.data.pods || [];
    instances.value = pods.value.filter((d: unknown, index: number) => index < pageSize);
    queryInstanceMetrics(instances.value);
  }

  async function queryInstanceMetrics(arr: Instance[]) {
    if (!arr.length) {
      return;
    }
    const currentInstances = arr.map((d: Instance) => {
      return {
        id: d.id,
        value: d.value,
        label: d.label,
        merge: d.merge,
        language: d.language,
        instanceUUID: d.instanceUUID,
        attributes: d.attributes,
      };
    });
    queryInstanceExpressions(currentInstances);
  }

  async function queryInstanceExpressions(currentInstances: Instance[]) {
    const expressions = props.config.expressions || [];
    const subExpressions = props.config.subExpressions || [];

    if (expressions.length && expressions[0]) {
      const params = await useExpressionsQueryPodsMetrics(
        currentInstances,
        { metricConfig: metricConfig.value || [], expressions, subExpressions },
        EntityType[3].value,
      );
      instances.value = params.data;
      colMetrics.value = params.names;
      colSubMetrics.value = params.subNames;
      typesOfMQE.value = params.metricTypesArr;
      metricConfig.value = params.metricConfigArr;
      emit("expressionTips", { tips: params.expressionsTips, subTips: params.subExpressionsTips });

      return;
    }
    instances.value = currentInstances;
    colSubMetrics.value = [];
    colMetrics.value = [];
    typesOfMQE.value = [];
    metricConfig.value = [];
    emit("expressionTips", [], []);
  }

  function clickInstance(scope: any) {
    const { dashboard } = getDashboard({
      name: props.config.dashboardName,
      layer: dashboardStore.layerId,
      entity: EntityType[3].value,
    });
    if (!dashboard) {
      ElMessage.error("No this dashboard");
      return;
    }
    router.push(
      `/dashboard/${dashboard.layer}/${dashboard.entity}/${selectorStore.currentService.id}/${
        scope.row.id
      }/${dashboard.name.split(" ").join("-")}`,
    );
  }

  function changePage() {
    let podList = pods.value;
    if (searchText.value) {
      podList = pods.value.filter((d: { label: string }) => d.label.includes(searchText.value));
    }
    instances.value = podList.filter(
      (_, index: number) => index >= (currentPage.value - 1) * pageSize && index < currentPage.value * pageSize,
    );
    queryInstanceMetrics(instances.value);
  }

  function handleCurrentChange(val: number) {
    currentPage.value = val;
    changePage();
  }

  function searchList() {
    const searchInstances = pods.value.filter((d: { label: string }) => d.label.includes(searchText.value));
    instances.value = searchInstances.filter((_, index: number) => index < pageSize);
    queryInstanceMetrics(instances.value);
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
      queryInstanceMetrics(instances.value);
    },
  );
  watch(
    () => selectorStore.currentService,
    () => {
      queryInstance();
    },
  );
</script>
<style lang="scss" scoped>
  @import url("./style.scss");

  .attributes {
    max-height: 400px;
    overflow: auto;
  }

  .link {
    color: $active-color;
  }
</style>
