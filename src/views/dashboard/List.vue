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
        :style="{ width: '100%' }"
        max-height="550"
        v-loading="loading"
      >
        <el-table-column fixed prop="name" label="Name" />
        <el-table-column prop="layer" label="Layer" />
        <el-table-column prop="entity" label="Entity" />
        <el-table-column label="Operations">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.$index)">
              {{ t("view") }}
            </el-button>
            <el-button size="small" @click="handleEdit(scope.$index)">
              {{ t("edit") }}
            </el-button>
            <el-popconfirm
              title="Are you sure to delete this?"
              @confirm="handleDelete(scope.$index)"
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
import { ElTable, ElTableColumn, ElButton, ElInput } from "element-plus";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useDashboardStore } from "@/store/modules/dashboard";
import router from "@/router";
import { ElMessageBox, ElMessage } from "element-plus";

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
const dashboards = ref<{ name: string; layer: string; entity: string }[]>([]);
const searchText = ref<string>("");
const loading = ref<boolean>(false);

setList();

async function setList() {
  await dashboardStore.setDashboards();
  dashboards.value = dashboardStore.dashboards;
}
const handleView = (index: number) => {
  const d = dashboards.value[index];
  dashboardStore.setCurrentDashboard(d);
  router.push(
    `/dashboard/${d.layer}/${d.entity}/${d.name.split(" ").join("-")}`
  );
};
function handleEdit(index: number) {
  const d = dashboards.value[index];

  ElMessageBox.prompt("Please input dashboard name", "Edit", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    inputValue: d.name,
  })
    .then(({ value }) => {
      dashboardStore.setCurrentDashboard(d);
      dashboardStore.updateDashboard({ name: value });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "Input canceled",
      });
    });
}
async function handleDelete(index: number) {
  const row = dashboards.value[index];
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
  border-radius: 3px;
}
</style>
