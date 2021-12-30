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
  <div class="alert-table">
    <el-button class="alert-create" type="primary" size="small">{{
      t("createAAlert")
    }}</el-button>
    <el-table :data="tableData" border>
      <el-table-column
        v-for="(h, index) in tableHeader"
        :label="t(h)"
        :key="h + index"
      >
        <template #default="scope">
          <span v-if="h !== 'operate'">{{ scope.row[h] }}</span>
          <el-button v-else type="danger" size="mini">{{
            t("delete")
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { ElButton, ElTable, ElTableColumn } from "element-plus";

const route = useRoute();
const { t } = useI18n();
const tableHeader = ["name", "entityType", "description", "status", "operate"];
const tableData = [
  {
    name: "xxxx-name",
    entityType: "Service",
    description: "xxxxxxx",
    status: "Disable",
  },
  {
    name: "xxxx-name",
    entityType: "Service",
    description: "xxxxxxx",
    status: "Disable",
  },
];
const state = reactive({
  path: route.meta.headPath,
});
watch(
  () => route.meta.headPath,
  (path: unknown) => {
    if (!path) {
      return;
    }
    state.path = path;
  }
);
</script>
<style lang="scss" scoped>
.alert-name {
  color: #448edf;
  cursor: pointer;
}

.alert-table {
  padding: 15px;
}

.alert-create {
  float: right;
  margin-bottom: 15px;
}
</style>
