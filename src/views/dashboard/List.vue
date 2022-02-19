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
        placeholder="Please input"
        class="input-with-search"
        size="small"
      >
        <template #append>
          <el-button size="small">
            <Icon size="lg" iconName="search" />
          </el-button>
        </template>
      </el-input>
      <router-link to="/dashboard/new">
        <el-button size="small" type="primary">
          + {{ t("newDashboard") }}
        </el-button>
      </router-link>
    </div>
    <el-table :data="tableData" style="width: 100%" max-height="550">
      <el-table-column fixed prop="name" label="Name" />
      <el-table-column prop="type" label="Type" />
      <el-table-column prop="date" label="Date" />
      <el-table-column label="Operations">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
            {{ t("view") }}
          </el-button>
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">
            {{ t("edit") }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >
            {{ t("delete") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ElTable, ElTableColumn, ElButton, ElInput } from "element-plus";
import { useAppStoreWithOut } from "@/store/modules/app";

const appStore = useAppStoreWithOut();
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
const searchText = ref<string>("");
const tableData = [
  {
    date: "2016-05-03",
    name: "xxx",
    type: "general",
  },
  {
    date: "2016-05-02",
    name: "xxx",
    type: "k8s",
  },
  {
    date: "2016-05-04",
    name: "xxx",
    type: "database",
  },
  {
    date: "2016-05-01",
    name: "xxx",
    type: "mesh",
  },
];
const handleEdit = (index: number, row: any) => {
  console.log(index, row);
};
const handleDelete = (index: number, row: any) => {
  console.log(index, row);
};
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
</style>
