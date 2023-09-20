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
            metricTypes,
            metricMode,
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
      :page-size="pageSize"
      :total="pods.length"
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
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { InstanceListConfig } from "@/types/dashboard";
  import type { Instance } from "@/types/selector";
  import { useQueryPodsMetrics, usePodsSource } from "@/hooks/useMetricsProcessor";
  import { useExpressionsQueryPodsMetrics } from "@/hooks/useExpressionsProcessor";
  import { EntityType, MetricModes } from "../data";
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
          metricTypes: string[];
          isEdit: boolean;
          metricMode: string;
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
        metricTypes: [],
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
  const pageSize = 10;
  const searchText = ref<string>("");
  const colMetrics = ref<string[]>([]);
  const colSubMetrics = ref<string[]>([]);
  const metricConfig = ref<MetricConfigOpt[]>(props.config.metricConfig || []);
  const metricTypes = ref<string[]>(props.config.metricTypes || []);
  const pods = ref<Instance[]>([]); // all instances
  const metricMode = ref<string>(props.config.metricMode);
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
    if (props.config.metricMode === MetricModes.Expression) {
      queryInstanceExpressions(currentInstances);
      return;
    }
    const metrics = props.config.metrics || [];
    const types = props.config.metricTypes || [];

    if (metrics.length && metrics[0] && types.length && types[0]) {
      const params = await useQueryPodsMetrics(currentInstances, props.config, EntityType[3].value);
      const json = await dashboardStore.fetchMetricValue(params);

      if (json.errors) {
        ElMessage.error(json.errors);
        return;
      }
      const { data, names, metricConfigArr, metricTypesArr } = usePodsSource(currentInstances, json, {
        ...props.config,
        metricConfig: metricConfig.value,
      });
      instances.value = data;
      colMetrics.value = names;
      metricTypes.value = metricTypesArr;
      metricConfig.value = metricConfigArr;

      return;
    }
    instances.value = currentInstances;
    colMetrics.value = [];
    metricTypes.value = [];
    metricConfig.value = [];
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
      metricTypes.value = params.metricTypesArr;
      metricConfig.value = params.metricConfigArr;
      emit("expressionTips", { tips: params.expressionsTips, subTips: params.subExpressionsTips });

      return;
    }
    instances.value = currentInstances;
    colSubMetrics.value = [];
    colMetrics.value = [];
    metricTypes.value = [];
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

  function changePage(pageIndex: number) {
    instances.value = pods.value.filter((d: unknown, index: number) => {
      if (index >= (pageIndex - 1) * pageSize && index < pageIndex * pageSize) {
        return d;
      }
    });
    queryInstanceMetrics(instances.value);
  }

  function searchList() {
    const searchInstances = pods.value.filter((d: { label: string }) => d.label.includes(searchText.value));
    instances.value = searchInstances.filter((d: unknown, index: number) => index < pageSize);
    queryInstanceMetrics(instances.value);
  }

  watch(
    () => [
      ...(props.config.metricTypes || []),
      ...(props.config.metrics || []),
      ...(props.config.metricConfig || []),
      ...(props.config.expressions || []),
      ...(props.config.subExpressions || []),
      props.config.metricMode,
    ],
    (data, old) => {
      if (JSON.stringify(data) === JSON.stringify(old)) {
        return;
      }
      metricConfig.value = props.config.metricConfig;
      metricMode.value = props.config.metricMode;
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
