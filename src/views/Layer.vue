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
  <Dashboard v-if="dashboardStore.currentDashboard" />
  <div v-else class="no-root">
    {{ t("noRoot") }} {{ dashboardStore.layerId }}
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import { EntityType } from "./dashboard/data";
import { useDashboardStore } from "@/store/modules/dashboard";
import Dashboard from "./dashboard/Edit.vue";
import { useI18n } from "vue-i18n";
import { useAppStoreWithOut } from "@/store/modules/app";

const route = useRoute();
const { t } = useI18n();
const appStore = useAppStoreWithOut();
const dashboardStore = useDashboardStore();
const routesMap: { [key: string]: string } = {
  GeneralServices: "GENERAL",
  Database: "VIRTUAL_DATABASE",
  MeshServices: "MESH",
  ControlPanel: "MESH_CP",
  DataPanel: "MESH_DP",
  Linux: "OS_LINUX",
  SkyWalkingServer: "SO11Y_OAP",
  Satellite: "SO11Y_SATELLITE",
  Functions: "FAAS",
  Browser: "BROWSER",
  KubernetesCluster: "K8S",
  KubernetesService: "K8S_SERVICE",
};
const layer = ref<string>("GENERAL");

getDashboard();

async function getDashboard() {
  layer.value = routesMap[String(route.name)];
  dashboardStore.setLayer(layer.value);
  dashboardStore.setEntity(EntityType[1].value);
  dashboardStore.setMode(false);
  await dashboardStore.setDashboards();
  const index = dashboardStore.dashboards.findIndex(
    (d: { name: string; isRoot: boolean; layer: string; entity: string }) =>
      d.layer === dashboardStore.layerId &&
      d.entity === EntityType[1].value &&
      d.isRoot
  );
  if (index < 0) {
    appStore.setPageTitle(dashboardStore.layer);
    dashboardStore.setCurrentDashboard(null);
    return;
  }
  const item = dashboardStore.dashboards[index];
  dashboardStore.setCurrentDashboard(item);
}
</script>
<style lang="scss" scoped>
.no-root {
  padding: 15px;
  width: 100%;
  text-align: center;
  color: #888;
}
</style>
