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
    <h4>{{ t("newDashboard") }}</h4>
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
    <div class="item" v-show="state.entity === EntityType[0].value">
      <div class="label">{{ t("service") }}</div>
      <el-select
        size="small"
        v-model="state.service"
        placeholder="Select a service"
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
    <div class="item" v-show="state.entity === EntityType[2].value">
      <div class="label">{{ t("service") }} / {{ t("endpoint") }}</div>
      <el-cascader
        v-model="state.serviceEndpoint"
        :options="SelectOpt"
        :props="props"
        size="small"
        @change="handleChange"
        :style="{ width: '600px' }"
      ></el-cascader>
    </div>
    <div class="item" v-show="state.entity === EntityType[3].value">
      <div class="label">{{ t("service") }} / {{ t("instance") }}</div>
      <el-cascader
        v-model="state.serviceInstance"
        :options="SelectOpt"
        :props="props"
        size="small"
        @change="handleChange"
        :style="{ width: '600px' }"
      ></el-cascader>
    </div>
    <div class="item" v-show="state.entity === EntityType[4].value">
      <div class="label">{{ t("destService") }}</div>
      <el-select
        size="small"
        v-model="state.destService"
        placeholder="Select"
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
    <div class="item" v-show="state.entity === EntityType[5].value">
      <span class="label"
        >{{ t("destService") }} / {{ t("destServiceInstance") }}</span
      >
      <el-cascader
        v-model="state.destServiceEndpoint"
        :options="SelectOpt"
        :props="props"
        @change="handleChange"
        :style="{ width: '600px' }"
      ></el-cascader>
    </div>
    <div class="item" v-show="state.entity === EntityType[6].value">
      <span class="label">
        {{ t("destService") }} / {{ t("destEndpoint") }}
      </span>
      <el-cascader
        v-model="state.destServiceInstance"
        :options="SelectOpt"
        :props="props"
        @change="handleChange"
        :style="{ width: '600px' }"
      ></el-cascader>
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
import {
  ElSelect,
  ElOption,
  ElCascader,
  ElInput,
  ElButton,
} from "element-plus";
import { useSelectorStore } from "@/store/modules/selectors";
import { EntityType, SelectOpt, Options } from "./data";

const { t } = useI18n();
const selectorStore = useSelectorStore();
const props = {
  expandTrigger: "hover",
};
const state = reactive({
  name: "",
  layer: "",
  entity: EntityType[0].value,
  service: "",
  serviceEndpoint: "",
  serviceInstance: "",
  destService: "",
  destServiceEndpoint: "",
  destServiceInstance: "",
});
const handleChange = (value: any) => {
  console.log(value);
};
const onCreate = () => {
  let path = `/dashboard/edit/${state.entity}/`;
  switch (state.entity) {
    case EntityType[0].value:
      path += state.service || 1;
      break;
    case EntityType[2].value:
      path += `${state.service}/${state.serviceEndpoint}`;
      break;
    case EntityType[3].value:
      path += `${state.service}/${state.serviceInstance}`;
      break;
  }
  router.push(path);
};
selectorStore.fetchServices("general");
</script>
<style lang="scss" scoped>
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
