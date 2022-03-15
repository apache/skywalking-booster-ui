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
  <div class="service-table">
    <el-table :data="selectorStore.services" :border="true">
      <el-table-column
        v-for="(h, index) in tableHeader"
        :label="t(h)"
        :key="h + index"
      >
        <template #default="scope">
          <span
            v-if="h === tableHeader[1] && index !== 0"
            class="service-name cp"
            @click="visitLayout(scope.row)"
          >
            {{ scope.row[h] }}
          </span>
          <span v-else>{{ scope.row[h] }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { ElTable, ElTableColumn } from "element-plus";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import { EntityType } from "./dashboard/data";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import router from "@/router";

const route = useRoute();
const { t } = useI18n();
const appStore = useAppStoreWithOut();
const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const tableHeader = ["group", "label", "id"];
const path = [
  "GeneralServices",
  "Database",
  "MeshServices",
  "ControlPanel",
  "DataPanel",
];
const dashboards = ref<
  { name: string; layer: string; entity: string; isRoot: boolean }[]
>([]);
const layer = ref<string>("GENERAL");

getServices();
setList();

async function setList() {
  if (!sessionStorage.getItem("dashboards")) {
    const res = await dashboardStore.fetchTemplates();
    if (res.errors) {
      dashboards.value = [];
      ElMessage.error(res.errors);
      return;
    }
  }
  dashboards.value = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
}
async function getServices() {
  setLayer(String(route.name));
  const res = selectorStore.fetchServices(layer.value);
  if (res.errors) {
    ElMessage.error(res.errors);
  }
}

function visitLayout(row: { id: string }) {
  const l =
    dashboards.value.filter(
      (d: { name: string; isRoot: boolean; layer: string; entity: string }) =>
        d.layer === layer.value && d.entity === EntityType[0].value && d.isRoot
    )[0] || {};
  router.push(
    `/dashboard/${layer.value}/${EntityType[0].value}/${row.id}/${l.name
      .split(" ")
      .join("-")}`
  );
}
function setLayer(p: string) {
  switch (p) {
    case path[0]:
      layer.value = "GENERAL";
      break;
    case path[1]:
      layer.value = "VIRTUAL_DATABASE";
      break;
    case path[2]:
      layer.value = "MESH";
      break;
    case path[3]:
      layer.value = "MESH_CP";
      break;
    case path[4]:
      layer.value = "MESH_DP";
      break;
    default:
      layer.value = "GENERAL";
      break;
  }
  appStore.setPageTitle(layer.value);
}
watch(
  () => route.name,
  (name: unknown) => {
    if (!name) {
      return;
    }
    getServices();
  }
);
</script>
<style lang="scss" scoped>
.service-name {
  color: #448edf;
  cursor: pointer;
}

.service-table {
  padding: 15px;
}
</style>
