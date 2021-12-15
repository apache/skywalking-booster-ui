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
    <h4>Create a new dashboard</h4>
    <div class="item">
      <div class="label">Name</div>
      <el-input
        size="small"
        v-model="state.name"
        placeholder="Please input name"
      />
    </div>
    <div class="item">
      <div class="label">Layer</div>
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
      <div class="label">Entity</div>
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
    <div class="item" v-show="state.entity === 'Service'">
      <div class="label">Service</div>
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
    <div class="item" v-show="state.entity === 'Endpoint'">
      <div class="label">Service / Endpoint</div>
      <el-cascader
        v-model="state.serviceEndpoint"
        :options="SelectOpt"
        :props="props"
        size="small"
        @change="handleChange"
        :style="{ width: '600px' }"
      ></el-cascader>
    </div>
    <div class="item" v-show="state.entity === 'ServiceInstance'">
      <div class="label">Service / Instance</div>
      <el-cascader
        v-model="state.serviceInstance"
        :options="SelectOpt"
        :props="props"
        size="small"
        @change="handleChange"
        :style="{ width: '600px' }"
      ></el-cascader>
    </div>
    <div class="item" v-show="state.entity === 'ServiceRelation'">
      <div class="label">Destination Service</div>
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
    <div class="item" v-show="state.entity === 'EndpointRelation'">
      <span class="label">Destination Service / Endpoint</span>
      <el-cascader
        v-model="state.destServiceEndpoint"
        :options="SelectOpt"
        :props="props"
        @change="handleChange"
        :style="{ width: '600px' }"
      ></el-cascader>
    </div>
    <div class="item" v-show="state.entity === 'ServiceInstanceRelation'">
      <span class="label">Destination Service / Instance</span>
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
        Create
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import {
  ElSelect,
  ElOption,
  ElCascader,
  ElInput,
  ElButton,
} from "element-plus";
// import { useSelectorStore } from "@/store/modules/selectors";
import { EntityType, SelectOpt, Options } from "./data";

// const selectorStore = useSelectorStore();
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
  console.log(state);
};
// selectorStore.fetchServices("general");
</script>
<style lang="scss" scoped>
.new-dashboard {
  width: 600px;
  margin: 0 auto;
}
.item {
  margin-top: 20px;
}
.selectors {
  width: 600px;
}
.el-cascader-menu {
  width: 600px;
}
.create {
  width: 160px;
}
.btn {
  margin-top: 40px;
}
</style>
