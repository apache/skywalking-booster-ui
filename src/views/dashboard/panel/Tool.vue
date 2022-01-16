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
  <div class="dashboard-tool flex-h">
    <div class="flex-h">
      <div class="selectors-item" v-if="states.key < 3">
        <span class="label">$Service</span>
        <Selector
          :value="selectorStore.currentService"
          :options="selectorStore.services"
          size="mini"
          placeholder="Select a service"
          @change="changeService"
          class="selectors"
          :borderRadius="4"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 3 || states.key === 4">
        <span class="label">
          {{ states.entity === "endpoint" ? "$Endpoint" : "$ServiceInstance" }}
        </span>
        <el-cascader
          placeholder="Please Select data"
          :options="SelectOpts"
          size="mini"
          filterable
          :style="{ minWidth: '300px' }"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 2">
        <span class="label">$DestinationService</span>
        <Selector
          :value="selectorStore.currentDestService"
          :options="selectorStore.services"
          size="mini"
          placeholder="Select a service"
          :borderRadius="0"
          @change="changeService"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 4">
        <span class="label">$DestinationServiceInstance</span>
        <el-cascader
          placeholder="Select a instance"
          :options="SelectOpts"
          size="mini"
          filterable
          :style="{ minWidth: '300px' }"
        />
      </div>
    </div>
    <div class="tool-icons">
      <el-tooltip
        v-for="(t, index) in ToolIcons"
        :key="index"
        class="item"
        :content="t.content"
        placement="top"
      >
        <span class="icon-btn" @click="clickIcons(t)">
          <Icon size="sm" :iconName="t.name" />
        </span>
      </el-tooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onBeforeMount } from "vue";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
import { SelectOpts, EntityType, ToolIcons } from "../data";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";

const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const params = useRoute().params;
const states = reactive<{
  entity: string | string[];
  layerId: string | string[];
  pod: string;
  destService: string;
  destPod: string;
  key: number;
}>({
  pod: "", // instances or endpoints
  destService: "",
  destPod: "",
  key: EntityType.filter((d: any) => d.value === params.entity)[0].key || 0,
  entity: params.entity,
  layerId: params.layerId,
});

dashboardStore.setLayer(states.layerId);
dashboardStore.setEntity(states.entity);
onBeforeMount(async () => {
  if (!states.layerId) {
    return;
  }
  const json = await selectorStore.fetchServices(states.layerId);
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  const resp = await selectorStore.getServiceInstances();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  // states.pods =
});

function changeService(service: { value: string; label: string }) {
  selectorStore.setCurrentService(service.value);
}

function clickIcons(t: { id: string; content: string; name: string }) {
  switch (t.id) {
    case "addWidget":
      dashboardStore.addControl("Widget");
      break;
    case "addTab":
      dashboardStore.addControl("Tab");
      break;
    case "addImage":
      dashboardStore.addControl("Image");
      break;
    case "settings":
      dashboardStore.setConfigPanel(true);
      break;
    default:
      dashboardStore.addControl("Widget");
  }
}
</script>
<style lang="scss" scoped>
.dashboard-tool {
  text-align: right;
  padding: 5px;
  background: rgb(240, 242, 245);
  border-bottom: 1px solid #dfe4e8;
  justify-content: space-between;
}

.label {
  font-size: 12px;
  display: inline-block;
  padding: 4px 2px;
}

.icon-btn {
  display: inline-block;
  padding: 0 5px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-left: 6px;
  cursor: pointer;
  background-color: #eee;
  color: #666;
}

.item {
  font-size: 12px;
}

.selectors {
  min-width: 180px;
}

.selectors-item {
  margin-right: 5px;
}
</style>
