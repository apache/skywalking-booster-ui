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
    <el-dropdown class="alert-create">
      <el-button type="primary" size="small">
        {{ t("addAlertChannel") }}
        <el-icon class="el-icon--right">
          <arrow-down />
        </el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="createChannel('email')">{{
            t("email")
          }}</el-dropdown-item>
          <el-dropdown-item @click="createChannel('slack')">{{
            t("slack")
          }}</el-dropdown-item>
          <el-dropdown-item @click="createChannel('weChat')">{{
            t("weChat")
          }}</el-dropdown-item>
          <el-dropdown-item @click="createChannel('dingDing')">{{
            t("dingDing")
          }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-table :data="tableData" border>
      <el-table-column
        v-for="(h, index) in tableHeader"
        :label="t(h)"
        :key="h + index"
      >
        <template #default="scope">
          <span v-if="h !== 'action'">{{ scope.row[h] }}</span>
          <el-button v-else type="danger" size="mini">{{
            t("delete")
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <el-dialog
    v-model="dialogVisible"
    :title="
      t('create') + ' ' + t(dialogType) + ' ' + t('alert') + ' ' + t('channel')
    "
  >
    <el-form :model="form" label-position="top">
      <el-form-item :label="t('name')">
        <el-input v-model="form.name" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item v-if="dialogType === 'email'" :label="t('email')">
        <el-input v-model="form.email" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item v-if="dialogType !== 'email'" :label="t('webHookURL')">
        <el-input v-model="form.email" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item v-if="dialogType !== 'email'" :label="t('iconURL')">
        <el-input v-model="form.email" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item v-if="dialogType !== 'email'" :label="t('channelName')">
        <el-input v-model="form.email" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ t("cancel") }}</el-button>
        <el-button type="primary" @click="dialogVisible = false">{{
          t("create")
        }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElDialog,
  ElIcon,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElButton,
  ElTable,
  ElTableColumn,
} from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";

const { t } = useI18n();
const tableHeader = ["name"];
const tableData = [
  {
    name: "email",
  },
  {
    name: "weChat",
  },
];

let dialogVisible = ref(false);
let dialogType = ref("");
let form = ref({
  name: "",
  email: "",
  webHookURL: "",
  iconURL: "",
  channelName: "",
});

let createChannel = (type: string) => {
  dialogType.value = type;
  dialogVisible.value = true;
};
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
