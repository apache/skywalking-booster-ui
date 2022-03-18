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
        :data="dashboards"
        :style="{ width: '100%', fontSize: '13px' }"
        v-loading="loading"
        ref="multipleTableRef"
        :default-sort="{ prop: 'name' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="Name" />
        <el-table-column prop="layer" label="Layer" width="200" />
        <el-table-column prop="entity" label="Entity" width="200" />
        <el-table-column prop="isRoot" label="Root" width="100">
          <template #default="scope">
            {{ scope.row.isRoot ? t("yes") : t("no") }}
          </template>
        </el-table-column>
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
                <el-button size="small" style="width: 120px">
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
      <div class="toggle-selection">
        <el-button size="default" class="btn" @click="exportTemplates">
          <Icon class="mr-5" iconName="save_alt" />
          {{ t("export") }}
        </el-button>
        <el-button class="ml-10 btn" size="default">
          <input
            ref="dashboardFile"
            id="dashboard-file"
            class="import-template"
            type="file"
            name="file"
            title=""
            accept=".json"
            @change="importTemplates"
          />
          <label for="dashboard-file" class="input-label">
            <Icon class="mr-5" iconName="folder_open" />
            {{ t("import") }}
          </label>
        </el-button>
      </div>
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
import { saveFile, readFile } from "@/utils/file";

/*global Nullable*/
const { t } = useI18n();
const appStore = useAppStoreWithOut();
const dashboardStore = useDashboardStore();
const dashboards = ref<DashboardItem[]>([]);
const searchText = ref<string>("");
const loading = ref<boolean>(false);
const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const multipleSelection = ref<DashboardItem[]>([]);
const dashboardFile = ref<Nullable<HTMLDivElement>>(null);
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
appStore.setPageTitle("Dashboard List");
const handleSelectionChange = (val: DashboardItem[]) => {
  multipleSelection.value = val;
};
setList();
async function setList() {
  await dashboardStore.setDashboards();
  dashboards.value = dashboardStore.dashboards;
}
async function importTemplates(event: any) {
  const arr: any = await readFile(event);
  for (const item of arr) {
    const { layer, name, entity } = item.configuration;
    const index = dashboardStore.dashboards.findIndex(
      (d: DashboardItem) =>
        d.name === name && d.entity === entity && d.layer === layer
    );
    if (index > -1) {
      return ElMessage.error("The dashboard name cannot be duplicate.");
    }
  }
  loading.value = true;
  for (const item of arr) {
    const { layer, name, entity, isRoot, children } = item.configuration;
    const index = dashboardStore.dashboards.findIndex(
      (d: DashboardItem) => d.id === item.id
    );
    const p: DashboardItem = {
      name: name,
      layer: layer,
      entity: entity,
      isRoot: false,
    };
    if (index > -1) {
      p.id = item.id;
      p.isRoot = isRoot;
    }
    dashboardStore.setCurrentDashboard(p);
    dashboardStore.setLayout(children);
    await dashboardStore.saveDashboard();
  }
  dashboards.value = dashboardStore.dashboards;
  loading.value = false;
  dashboardFile.value = null;
}
function exportTemplates() {
  const arr = multipleSelection.value.sort(
    (a: DashboardItem, b: DashboardItem) => {
      return a.name.localeCompare(b.name);
    }
  );
  const templates = arr.map((d: DashboardItem) => {
    const key = [d.layer, d.entity, d.name.split(" ").join("-")].join("_");
    const layout = JSON.parse(sessionStorage.getItem(key) || "{}");
    return layout;
  });
  const name = `dashboards.json`;
  saveFile(templates, name);
  setTimeout(() => {
    multipleTableRef.value!.clearSelection();
  }, 2000);
}
function handleView(row: DashboardItem) {
  dashboardStore.setCurrentDashboard(row);
  router.push(
    `/dashboard/${row.layer}/${row.entity}/${row.name.split(" ").join("-")}`
  );
}

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

.toggle-selection {
  margin-top: 20px;
  background-color: #fff;
}

.btn {
  width: 220px;
  font-size: 13px;
}

.import-template {
  display: none;
}

.input-label {
  line-height: 30px;
  height: 30px;
  width: 220px;
  cursor: pointer;
}
</style>
