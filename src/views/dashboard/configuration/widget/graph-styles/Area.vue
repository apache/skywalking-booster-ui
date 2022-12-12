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
    <span class="label">{{ t("areaOpacity") }}</span>
    <el-slider
      class="bar-width"
      v-model="opacity"
      show-input
      input-size="small"
      :min="0.1"
      :max="1"
      :step="0.1"
      @change="updateConfig({ opacity })"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import Legend from "./components/Legend.vue";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = dashboardStore.selectedGrid.graph || {};

  const opacity = ref(graph.opacity);

  function updateConfig(param: { [key: string]: unknown }) {
    const graph = {
      ...dashboardStore.selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, graph });
  }
</script>
<style lang="scss" scoped>
  .bar-width {
    width: 500px;
    margin-top: -13px;
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    display: block;
    margin-bottom: 5px;
  }
</style>
