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
  <div>
    <span class="label mr-5">{{ t("showLegend") }}</span>
    <el-switch
      v-model="legend.show"
      active-text="Yes"
      inactive-text="No"
      @change="updateLegendConfig({ show: legend.show })"
    />
  </div>
  <div>
    <span class="label">{{ t("asTable") }}</span>
    <el-switch
      v-model="legend.asTable"
      active-text="Yes"
      inactive-text="No"
      @change="updateLegendConfig({ asTable: legend.asTable })"
    />
  </div>
  <div v-show="legend.asTable">
    <span class="label">{{ t("legendOptions") }}</span>
    <span class="title mr-5">{{ t("toTheRight") }}</span>
    <el-switch
      v-model="legend.toTheRight"
      active-text="Yes"
      inactive-text="No"
      @change="updateLegendConfig({ toTheRight: legend.toTheRight })"
    />
    <span class="title ml-20 mr-5">{{ t("width") }}</span>
    <el-input
      v-model="legend.width"
      class="inputs"
      size="small"
      placeholder="Please input the width"
      @change="updateLegendConfig({ width: legend.width })"
    />
  </div>
  <div v-show="legend.asTable">
    <span class="label">{{ t("legendValues") }}</span>
    <span class="title mr-5">{{ t("min") }}</span>
    <el-switch
      v-model="legend.min"
      active-text="Yes"
      inactive-text="No"
      @change="updateLegendConfig({ min: legend.min })"
    />
    <span class="title ml-20 mr-5">{{ t("max") }}</span>
    <el-switch
      v-model="legend.max"
      active-text="Yes"
      inactive-text="No"
      @change="updateLegendConfig({ max: legend.max })"
    />
    <span class="title ml-20 mr-5">{{ t("mean") }}</span>
    <el-switch
      v-model="legend.mean"
      active-text="Yes"
      inactive-text="No"
      @change="updateLegendConfig({ mean: legend.mean })"
    />
    <span class="title ml-20 mr-5">{{ t("total") }}</span>
    <el-switch
      v-model="legend.total"
      active-text="Yes"
      inactive-text="No"
      @change="updateLegendConfig({ total: legend.total })"
    />
  </div>
</template>
<script lang="ts" setup>
  import { computed, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { LegendOptions } from "@/types/dashboard";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = computed(() => dashboardStore.selectedGrid.graph || {});
  const legend = reactive<LegendOptions>({
    show: true,
    total: false,
    min: false,
    max: false,
    mean: false,
    asTable: false,
    toTheRight: false,
    width: 130,
    ...graph.value.legend,
  });

  function updateLegendConfig(param: { [key: string]: unknown }) {
    const g = {
      ...dashboardStore.selectedGrid.graph,
      legend: {
        ...dashboardStore.selectedGrid.graph.legend,
        ...param,
      },
    };
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      graph: g,
    });
  }
</script>
<style lang="scss" scoped>
  .label {
    font-size: 13px;
    display: block;
    margin-top: 5px;
    margin-bottom: -5px;
  }

  .title {
    font-size: $font-size-smaller;
    display: inline-flex;
    height: 32px;
    line-height: 34px;
    vertical-align: middle;
  }

  .inputs {
    width: 120px;
  }
</style>
