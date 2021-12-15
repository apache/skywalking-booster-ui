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
      <div class="label">Layer</div>
      <el-select
        size="small"
        v-model="template"
        placeholder="Select"
        class="selectors"
      >
        <el-option
          v-for="item in options"
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
        v-model="entity"
        placeholder="Select"
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
    <div class="item">
      <div class="label">Service</div>
      <el-select
        size="small"
        v-model="template"
        placeholder="Select"
        class="selectors"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <div class="label">Service / Endpoint</div>
      <el-cascader
        v-model="value"
        :options="options"
        :props="props"
      ></el-cascader>
    </div>
    <div class="item">
      <div class="label">Destination Service</div>
      <el-select
        size="small"
        v-model="template"
        placeholder="Select"
        class="selectors"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <span class="label">Destination Service / Endpoint</span>
      <el-cascader
        v-model="value"
        :options="options"
        :props="props"
      ></el-cascader>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { ElSelect, ElOption, ElCascader } from "element-plus";
import { useSelectorStore } from "@/store/modules/selectors";

const EntityType = [
  { value: "Service", label: "Service" },
  { value: "All", label: "All" },
  { value: "Endpoint", label: "Service Endpoint" },
  { value: "ServiceInstance", label: "Service Instance" },
  { value: "ServiceRelation", label: "Service Relation" },
  { value: "ServiceInstanceRelation", label: "Service Instance Relation" },
  { value: "EndpointRelation", label: "Endpoint Relation" },
];
const selectorStore = useSelectorStore();
const entity = ref("");
const template = ref("");
const options = ref([]);
selectorStore.fetchServices("general");
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
</style>
