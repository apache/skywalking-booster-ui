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
  <Edit v-if="dashboardStore.currentDashboard" />
  <div class="no-root" v-else>Please set a root dashboard for {{ layer }}</div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { EntityType } from "./dashboard/data";
import { useDashboardStore } from "@/store/modules/dashboard";
import Edit from "./dashboard/Edit.vue";

const route = useRoute();
const dashboardStore = useDashboardStore();
const routeNames = [
  "GeneralServices",
  "Database",
  "MeshServices",
  "ControlPanel",
  "DataPanel",
];
const layer = ref<string>("GENERAL");
getDashboard();

async function getDashboard() {
  dashboardStore.setCurrentDashboard(null);
  setLayer(String(route.name));
  await dashboardStore.setDashboards();
  const index = dashboardStore.dashboards.findIndex(
    (d: { name: string; isRoot: boolean; layer: string; entity: string }) =>
      d.layer === layer.value && d.entity === EntityType[1].value && d.isRoot
  );
  if (index < 0) {
    return;
  }
  const d = dashboardStore.dashboards[index];
  dashboardStore.setCurrentDashboard(d);
}
function setLayer(n: string) {
  switch (n) {
    case routeNames[0]:
      layer.value = "GENERAL";
      break;
    case routeNames[1]:
      layer.value = "VIRTUAL_DATABASE";
      break;
    case routeNames[2]:
      layer.value = "MESH";
      break;
    case routeNames[3]:
      layer.value = "MESH_CP";
      break;
    case routeNames[4]:
      layer.value = "MESH_DP";
      break;
    default:
      layer.value = "GENERAL";
      break;
  }
  // appStore.setPageTitle(layer.value);
}
watch(
  () => route.name,
  (name: unknown) => {
    if (!name) {
      return;
    }
    getDashboard();
  }
);
</script>
<style lang="scss" scoped>
.no-root {
  padding: 15px;
  width: 100%;
  text-align: center;
  color: #888;
}
</style>
