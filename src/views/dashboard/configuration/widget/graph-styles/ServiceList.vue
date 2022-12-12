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
  <div class="item">
    <span class="label">{{ t("showGroup") }}</span>
    <el-switch
      v-model="graph.showGroup"
      active-text="Yes"
      inactive-text="No"
      @change="updateConfig({ showGroup: graph.showGroup })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("fontSize") }}</span>
    <el-slider
      class="slider"
      v-model="fontSize"
      show-input
      input-size="small"
      :min="10"
      :max="20"
      :step="1"
      @change="updateConfig({ fontSize })"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = computed(() => dashboardStore.selectedGrid.graph || {});
  const fontSize = ref(graph.value.fontSize);

  function updateConfig(param: { [key: string]: unknown }) {
    const { selectedGrid } = dashboardStore;
    const graph = {
      ...selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...selectedGrid, graph });
  }
</script>
<style lang="scss" scoped>
  .slider {
    width: 500px;
    margin-top: -13px;
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    display: block;
    margin-bottom: 5px;
  }

  .item {
    margin-top: 5px;
  }
</style>
