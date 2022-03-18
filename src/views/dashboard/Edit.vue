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
  <Tool />
  <div class="ds-main" @click="handleClick">
    <grid-layout />
    <el-dialog
      v-model="dashboardStore.showConfig"
      :title="t('editGraph')"
      fullscreen
      :destroy-on-close="true"
      @closed="dashboardStore.setConfigPanel(false)"
    >
      <TopologyConfig v-if="dashboardStore.selectedGrid.type === 'Topology'" />
      <Widget v-else />
    </el-dialog>
    <el-dialog
      v-model="dashboardStore.showTopology"
      :destroy-on-close="true"
      fullscreen
      @closed="dashboardStore.setTopology(false)"
      custom-class="dark-dialog"
    >
      <Topology />
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import GridLayout from "./panel/Layout.vue";
import Tool from "./panel/Tool.vue";
import Widget from "./configuration/Widget.vue";
import TopologyConfig from "./configuration/Topology.vue";
import Topology from "./related/topology/Index.vue";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";

const dashboardStore = useDashboardStore();
const appStore = useAppStoreWithOut();
const { t } = useI18n();
const p = useRoute().params;
const layoutKey = `${p.layerId}_${p.entity}_${p.name}`;

setTemplate();

async function setTemplate() {
  await dashboardStore.setDashboards();
  const c: { configuration: string; id: string } = JSON.parse(
    sessionStorage.getItem(layoutKey) || "{}"
  );
  const layout: any = c.configuration || {};
  dashboardStore.setLayout(layout.children || []);
  appStore.setPageTitle(layout.name);

  if (!dashboardStore.currentDashboard) {
    dashboardStore.setCurrentDashboard({
      layer: p.layerId,
      entity: p.entity,
      name: p.name,
      id: c.id,
      isRoot: layout.isRoot,
    });
  }
}
function handleClick(e: any) {
  e.stopPropagation();
  if (e.target.className === "ds-main") {
    dashboardStore.activeGridItem("");
    dashboardStore.selectWidget(null);
  }
}
</script>
<style lang="scss" scoped>
.ds-main {
  height: calc(100% - 45px);
  overflow: auto;
}

.layout {
  height: 100%;
  flex-grow: 2;
  overflow: hidden;
}

.grids {
  height: 100%;
  overflow-y: auto;
}
</style>
