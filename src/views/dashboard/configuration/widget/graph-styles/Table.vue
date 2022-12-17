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
    <span class="label">{{ t("showValues") }}</span>
    <el-switch
      v-model="showTableValues"
      active-text="Yes"
      inactive-text="No"
      @change="updateConfig({ showTableValues })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("tableHeaderCol1") }}</span>
    <el-input
      class="input"
      v-model="tableHeaderCol1"
      size="small"
      placeholder="none"
      @change="updateConfig({ tableHeaderCol1 })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("tableHeaderCol2") }}</span>
    <el-input
      class="input"
      v-model="tableHeaderCol2"
      size="small"
      placeholder="none"
      @change="updateConfig({ tableHeaderCol2 })"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = dashboardStore.selectedGrid.graph || {};
  const showTableValues = ref(graph.showTableValues);
  const tableHeaderCol1 = ref(graph.tableHeaderCol1);
  const tableHeaderCol2 = ref(graph.tableHeaderCol2);

  function updateConfig(param: { [key: string]: unknown }) {
    const graph = {
      ...dashboardStore.selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, graph });
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
    margin-top: 10px;
  }
</style>
