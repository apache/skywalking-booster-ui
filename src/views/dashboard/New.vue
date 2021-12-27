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
        v-model="states.name"
        placeholder="Please input name"
      />
    </div>
    <div class="item">
      <div class="label">{{ t("layer") }}</div>
      <Selector
        :value="states.layer"
        :options="Options"
        size="small"
        placeholder="Select a layer"
        @change="changeLayer"
        class="selectors"
      />
    </div>
    <div class="item">
      <div class="label">{{ t("entityType") }}</div>
      <Selector
        :value="states.entity"
        :options="EntityType"
        size="small"
        placeholder="Select a entity"
        @change="changeEntity"
        class="selectors"
      />
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
import { ElInput, ElButton } from "element-plus";
import { useSelectorStore } from "@/store/modules/selectors";
import { EntityType, Options } from "./data";
import uuid from "@/utils/uuid";

const { t } = useI18n();
const selectorStore = useSelectorStore();
const states = reactive({
  name: "",
  layer: Options[0].value,
  entity: EntityType[0].value,
});
const onCreate = () => {
  const id = uuid();
  const path = `/dashboard/edit/${states.layer}/${states.entity}/${id}`;
  router.push(path);
};
selectorStore.fetchServices("general");
function changeLayer(opt: { label: string; value: string }) {
  states.layer = opt.value;
}
function changeEntity(opt: { label: string; value: string }) {
  states.entity = opt.value;
}
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
.selectors {
  width: 600px;
}

.create {
  width: 600px;
}

.btn {
  margin-top: 40px;
}
</style>
