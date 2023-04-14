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
  <Legend />
  <div>
    <span class="label">{{ t("showXAxis") }}</span>
    <el-switch
      v-model="graph.showXAxis"
      active-text="Yes"
      inactive-text="No"
      @change="updateConfig({ showXAxis: graph.showXAxis })"
    />
  </div>
  <div>
    <span class="label">{{ t("showYAxis") }}</span>
    <el-switch
      v-model="graph.showYAxis"
      active-text="Yes"
      inactive-text="No"
      @change="updateConfig({ showYAxis: graph.showYAxis })"
    />
  </div>
  <div>
    <span class="label">{{ t("smooth") }}</span>
    <el-switch v-model="smooth" active-text="Yes" inactive-text="No" @change="updateConfig({ smooth })" />
  </div>
  <div>
    <span class="label">{{ t("showSymbol") }}</span>
    <el-switch v-model="showSymbol" active-text="Yes" inactive-text="No" @change="updateConfig({ showSymbol })" />
  </div>
  <div>
    <span class="label">{{ t("step") }}</span>
    <el-switch v-model="step" active-text="Yes" inactive-text="No" @change="updateConfig({ step })" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import Legend from "./components/Legend.vue";
  import { isDef } from "@/utils/is";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = computed(() => dashboardStore.selectedGrid.graph || {});
  const smooth = ref(graph.value.smooth);
  const showSymbol = ref(isDef(graph.value.showSymbol) ? graph.value.showSymbol : true);
  const step = ref(graph.value.step);

  function updateConfig(param: { [key: string]: unknown }) {
    const graph = {
      ...dashboardStore.selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, graph });
  }
</script>
<style lang="scss" scoped>
  .label {
    font-size: 13px;
    display: block;
    margin-top: 5px;
    margin-bottom: -5px;
  }
</style>
