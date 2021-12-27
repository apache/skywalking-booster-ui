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
  <div class="new-dashboard">
    <div class="title">{{ t("newDashboard") }}</div>
    <div class="item">
      <div class="label">{{ t("name") }}</div>
      <el-input
        size="small"
        v-model="state.name"
        placeholder="Please input name"
      />
    </div>
    <div class="item">
      <div class="label">{{ t("layer") }}</div>
      <el-select
        size="small"
        v-model="state.layer"
        placeholder="Select a layer"
        class="selectors"
      >
        <el-option
          v-for="item in Options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <div class="label">{{ t("entityType") }}</div>
      <el-select
        size="small"
        v-model="state.entity"
        placeholder="Select a entity"
        class="selectors"
      >
        <el-option
          v-for="item in EntityType"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="btn">
      <el-button class="create" size="small" type="primary" @click="onCreate">
        {{ t("create") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import router from "@/router";
import { ElSelect, ElOption, ElInput, ElButton } from "element-plus";
import { useSelectorStore } from "@/store/modules/selectors";
import { EntityType, Options } from "./data";

const { t } = useI18n();
const selectorStore = useSelectorStore();
const props = {
  expandTrigger: "hover",
};
const state = reactive({
  name: "",
  layer: "",
  entity: EntityType[0].value,
});
const onCreate = () => {
  const id = "1";
  const path = `/dashboard/edit/${state.layer}/${state.entity}/${id}`;
  router.push(path);
};
selectorStore.fetchServices("general");
</script>
<style lang="scss" scoped>
.title {
  font-size: 18px;
  font-weight: bold;
  padding-top: 20px;
}

.new-dashboard {
  margin: 0 auto;
}

.item {
  margin-top: 20px;
}

.new-dashboard,
.selectors,
.el-cascader-menu {
  width: 600px;
}

.create {
  width: 600px;
}

.btn {
  margin-top: 40px;
}
</style>
