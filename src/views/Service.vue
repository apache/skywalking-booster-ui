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
    <div class="search">
      <el-input
        v-model="searchText"
        placeholder="Please input name"
        class="input-with-search"
        size="small"
        @change="searchServices"
      >
        <template #append>
          <el-button size="small">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
    </div>
    <el-table
      :data="services"
      :span-method="objectSpanMethod"
      :border="true"
      :style="{ fontSize: '14px' }"
      v-loading="loading"
    >
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
import { Service } from "@/types/selector";
import router from "@/router";

const route = useRoute();
const { t } = useI18n();
const appStore = useAppStoreWithOut();
const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const tableHeader = ["group", "label", "id"];
const routeNames = [
  "GeneralServices",
  "Database",
  "MeshServices",
  "ControlPanel",
  "DataPanel",
];
const loading = ref<boolean>(false);
const layer = ref<string>("GENERAL");
const searchText = ref<string>("");
const services = ref<Service[]>([]);
const groups = ref<any>({});

getServices();
dashboardStore.setDashboards();

async function getServices() {
  setLayer(String(route.name));
  loading.value = true;
  const res = await selectorStore.fetchServices(layer.value);
  if (res.errors) {
    ElMessage.error(res.errors);
    services.value = [];
    return;
  }
  loading.value = false;
  const map: { [key: string]: any[] } = selectorStore.services.reduce(
    (result: { [key: string]: any[] }, item: any) => {
      item.group = item.group || "";
      if (result[item.group]) {
        item.merge = true;
      } else {
        item.merge = false;
        result[item.group] = [];
      }
      result[item.group].push(item);
      return result;
    },
    {}
  );
  services.value = Object.values(map).flat(1);
  const obj = {} as any;
  for (const s of services.value) {
    s.group = s.group || "";
    if (!obj[s.group]) {
      obj[s.group] = 1;
    } else {
      obj[s.group]++;
    }
    groups.value[s.group] = obj[s.group];
  }
}

function objectSpanMethod(param: any): any {
  if (param.columnIndex !== 0) {
    return;
  }
  if (param.row.merge) {
    return {
      rowspan: 0,
      colspan: 0,
    };
  } else {
    return { rowspan: groups.value[param.row.group], colspan: 1 };
  }
}

function searchServices() {
  services.value = dashboardStore.services.filter((s: Service) =>
    s.label.includes(searchText.value)
  );
}

function visitLayout(row: { id: string }) {
  const l =
    dashboardStore.dashboards.filter(
      (d: { name: string; isRoot: boolean; layer: string; entity: string }) =>
        d.layer === layer.value && d.entity === EntityType[0].value && d.isRoot
    )[0] || {};
  dashboardStore.setCurrentDashboard(l);
  router.push(
    `/dashboard/${layer.value}/${EntityType[0].value}/${row.id}/${(l.name || "")
      .split(" ")
      .join("-")}`
  );
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
  background-color: #fff;
  margin: 30px 10px;
  border-radius: 3px;
  max-height: 100%;
  overflow: auto;
}

.search {
  margin-bottom: 20px;
  width: 300px;
  float: right;
}
</style>
