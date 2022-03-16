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
  <div class="dashboard-list">
    <div class="flex-h header" style="margin: 10px 0">
      <el-input
        v-model="searchText"
        placeholder="Please input name"
        class="input-with-search"
        size="small"
        @change="searchDashboards"
      >
        <template #append>
          <el-button size="small">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
      <router-link to="/dashboard/new">
        <el-button size="small" type="primary">
          + {{ t("newDashboard") }}
        </el-button>
      </router-link>
    </div>
    <div class="table">
      <el-table
        :border="true"
        :data="dashboards"
        :style="{ width: '100%', fontSize: '13px' }"
        max-height="550"
        v-loading="loading"
      >
        <el-table-column fixed prop="name" label="Name" />
        <el-table-column prop="layer" label="Layer" width="200" />
        <el-table-column prop="entity" label="Entity" width="200" />
        <el-table-column prop="isRoot" label="Root" width="100" />
        <el-table-column label="Operations">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">
              {{ t("view") }}
            </el-button>
            <el-button size="small" @click="handleEdit(scope.row)">
              {{ t("edit") }}
            </el-button>
            <el-popconfirm
              title="Are you sure to set this?"
              @confirm="setRoot(scope.row)"
            >
              <template #reference>
                <el-button size="small">
                  {{ scope.row.isRoot ? t("setNormal") : t("setRoot") }}
                </el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm
              title="Are you sure to delete this?"
              @confirm="handleDelete(scope.row)"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  {{ t("delete") }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessageBox, ElMessage } from "element-plus";
import type { ElTable } from "element-plus";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useDashboardStore } from "@/store/modules/dashboard";
import router from "@/router";
import { DashboardItem } from "@/types/dashboard";

const appStore = useAppStoreWithOut();
const dashboardStore = useDashboardStore();
appStore.setPageTitle("Dashboard List");
//  # - os-linux
//  # - k8s
//  # - general(agent-installed)
//  # - faas
//  # - mesh
//  # - mesh-cp
//  # - mesh-dp
//  # - database
//  # - cache
//  # - browser
//  # - skywalking
const { t } = useI18n();
const dashboards = ref<DashboardItem[]>([]);
const searchText = ref<string>("");
const loading = ref<boolean>(false);
const multipleTableRef = ref<InstanceType<typeof ElTable>>();

setList();

async function setList() {
  await dashboardStore.setDashboards();
  dashboards.value = dashboardStore.dashboards;
}
const handleView = (row: DashboardItem) => {
  dashboardStore.setCurrentDashboard(row);
  router.push(
    `/dashboard/${row.layer}/${row.entity}/${row.name.split(" ").join("-")}`
  );
};
async function setRoot(row: DashboardItem) {
  const items: any[] = [];
  loading.value = true;
  for (const d of dashboardStore.dashboards) {
    if (d.id === row.id) {
      d.isRoot = !row.isRoot;
      const key = [d.layer, d.entity, d.name.split(" ").join("-")].join("_");
      const layout = sessionStorage.getItem(key) || "{}";
      const c = {
        ...JSON.parse(layout).configuration,
        ...d,
      };
      delete c.id;

      const setting = {
        id: d.id,
        configuration: JSON.stringify(c),
      };
      const res = await dashboardStore.updateDashboard(setting);
      if (res.data.changeTemplate.id) {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            id: d.id,
            configuration: c,
          })
        );
      }
    }
    if (
      d.layer === row.layer &&
      d.entity === row.entity &&
      !row.isRoot &&
      d.isRoot
    ) {
      d.isRoot = false;
      const key = [d.layer, d.entity, d.name.split(" ").join("-")].join("_");
      const layout = sessionStorage.getItem(key) || "{}";
      const c = {
        ...JSON.parse(layout).configuration,
        ...d,
      };
      const setting = {
        id: d.id,
        configuration: JSON.stringify(c),
      };
      const res = await dashboardStore.updateDashboard(setting);
      if (res.data.changeTemplate.id) {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            id: d.id,
            configuration: c,
          })
        );
      }
    }
    items.push(d);
  }
  dashboardStore.resetDashboards(items);
  searchDashboards();
  loading.value = false;
}
function handleEdit(row: DashboardItem) {
  ElMessageBox.prompt("Please input dashboard name", "Edit", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    inputValue: row.name,
  })
    .then(({ value }) => {
      updateName(row, value);
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Input canceled",
      });
    });
}
async function updateName(d: DashboardItem, value: string) {
  const key = [d.layer, d.entity, d.name.split(" ").join("-")].join("_");
  const layout = sessionStorage.getItem(key) || "{}";
  const c = {
    ...JSON.parse(layout).configuration,
    ...d,
    name: value,
  };
  delete c.id;
  const setting = {
    id: d.id,
    configuration: JSON.stringify(c),
  };
  loading.value = true;
  const res = await dashboardStore.updateDashboard(setting);
  loading.value = false;
  if (!res.data.changeTemplate.id) {
    return;
  }
  dashboardStore.setCurrentDashboard({
    ...d,
    name: value,
  });
  dashboards.value = dashboardStore.dashboards.map((item: any) => {
    if (dashboardStore.currentDashboard.id === item.id) {
      item = dashboardStore.currentDashboard;
    }
    return item;
  });
  dashboardStore.resetDashboards(dashboards.value);
  sessionStorage.setItem("dashboards", JSON.stringify(dashboards.value));
  sessionStorage.removeItem(key);
  const str = [
    dashboardStore.currentDashboard.layer,
    dashboardStore.currentDashboard.entity,
    dashboardStore.currentDashboard.name.split(" ").join("-"),
  ].join("_");
  sessionStorage.setItem(
    str,
    JSON.stringify({
      id: d.id,
      configuration: c,
    })
  );
  searchText.value = "";
}
async function handleDelete(row: DashboardItem) {
  dashboardStore.setCurrentDashboard(row);
  loading.value = true;
  await dashboardStore.deleteDashboard();
  dashboards.value = dashboardStore.dashboards;
  loading.value = false;
  sessionStorage.setItem("dashboards", JSON.stringify(dashboards.value));
  sessionStorage.removeItem(
    `${row.layer}_${row.entity}_${row.name.split(" ").join("-")}`
  );
}
function searchDashboards() {
  const list = JSON.parse(sessionStorage.getItem("dashboards") || "[]");
  dashboards.value = list.filter((d: { name: string }) =>
    d.name.includes(searchText.value)
  );
}
</script>
<style lang="scss" scoped>
.header {
  flex-direction: row-reverse;
}

.dashboard-list {
  padding: 20px;
}

.input-with-search {
  width: 300px;
  margin-left: 20px;
}

.table {
  padding: 20px;
  background-color: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 5px;
}
</style>
