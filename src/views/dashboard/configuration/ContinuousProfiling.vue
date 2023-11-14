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
    <div>{{ t("instanceDashboards") }}</div>
    <Selector
      :value="instanceDashboardName || ''"
      :options="instanceDashboards"
      size="small"
      placeholder="Please select a dashboard name"
      @change="changeDashboard({ instanceDashboardName: $event[0].value })"
      class="selectors"
      :clearable="true"
    />
  </div>
  <div class="item">
    <div>{{ t("processDashboards") }}</div>
    <Selector
      :value="processDashboardName || ''"
      :options="processDashboards"
      size="small"
      placeholder="Please select a dashboard name"
      @change="changeDashboard({ processDashboardName: $event[0].value })"
      class="selectors"
      :clearable="true"
    />
  </div>
  <div class="footer">
    <el-button size="small">
      {{ t("cancel") }}
    </el-button>
    <el-button size="small" type="primary" @click="applyConfig">
      {{ t("apply") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { EntityType } from "../data";
  import type { DashboardItem } from "@/types/dashboard";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const instanceDashboardName = ref<boolean>(dashboardStore.selectedGrid.instanceDashboardName);
  const processDashboardName = ref<number>(dashboardStore.selectedGrid.processDashboardName);
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  const instanceDashboards: Array<DashboardItem & { label: string; value: string }> = [];
  const processDashboards: Array<DashboardItem & { label: string; value: string }> = [];

  for (const item of list) {
    if (item.layer === dashboardStore.layerId) {
      const i = {
        ...item,
        label: item.name,
        value: item.name,
      };
      if (item.entity === EntityType[8].value) {
        processDashboards.push(i);
      }
      if (item.entity === EntityType[3].value) {
        instanceDashboards.push(i);
      }
    }
  }

  function applyConfig() {
    dashboardStore.setConfigs(dashboardStore.selectedGrid);
    dashboardStore.setConfigPanel(false);
  }
  function changeDashboard(param: { [key: string]: unknown }) {
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      ...param,
    });
  }
</script>
<style lang="scss" scoped>
  .footer {
    position: fixed;
    bottom: 0;
    right: 0;
    border-top: 1px solid $border-color;
    padding: 10px;
    text-align: right;
    width: 100%;
    background-color: $theme-background;
  }

  .item {
    margin: 10px 0;
  }

  .selectors {
    width: 500px;
  }
</style>
