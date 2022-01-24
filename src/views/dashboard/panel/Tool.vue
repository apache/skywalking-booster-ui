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
    <div v-if="params.serviceId"></div>
    <div class="flex-h" v-else>
      <div class="selectors-item" v-if="states.key !== 10">
        <span class="label">$Service</span>
        <Selector
          v-model="states.currentService"
          :options="selectorStore.services"
          size="mini"
          placeholder="Select a service"
          @change="changeService"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 3 || states.key === 4">
        <span class="label">
          {{
            dashboardStore.entity === "Endpoint"
              ? "$Endpoint"
              : "$ServiceInstance"
          }}
        </span>
        <Selector
          v-model="states.currentPod"
          :options="selectorStore.pods"
          size="mini"
          placeholder="Select a data"
          @change="changePods"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 2">
        <span class="label">$DestinationService</span>
        <Selector
          v-model="selectorStore.currentDestService"
          :options="selectorStore.services"
          size="mini"
          placeholder="Select a service"
          @change="changeService"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 4">
        <span class="label">$DestinationServiceInstance</span>
        <Selector
          v-model="states.currentPod"
          :options="selectorStore.pods"
          size="mini"
          placeholder="Select a data"
          @change="changePods"
          class="selectors"
          :borderRadius="4"
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
import { reactive } from "vue";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
import { EntityType, ToolIcons } from "../data";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import { Option } from "@/types/app";
import { Service } from "@/types/selector";

const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const params = useRoute().params;
const type = EntityType.filter((d: Option) => d.value === params.entity)[0];
const states = reactive<{
  destService: string;
  destPod: string;
  key: number;
  currentService: string;
  currentPod: string;
}>({
  destService: "",
  destPod: "",
  key: (type && type.key) || 0,
  currentService: "",
  currentPod: "",
});

dashboardStore.setLayer(String(params.layerId));
dashboardStore.setEntity(String(params.entity));

if (params.serviceId) {
  setSelector();
} else {
  getServices();
}

async function setSelector() {
  await selectorStore.getService(String(params.serviceId));
  states.currentService = selectorStore.currentService.value;
  if (params.podId) {
    if (String(params.entity) === EntityType[2].value) {
      await selectorStore.getEndpoint(String(params.podId));
    }
    if (String(params.entity) === EntityType[3].value) {
      await selectorStore.getInstance(String(params.podId));
    }
    states.currentPod = selectorStore.currentPod.label;
  }
}

async function getServices() {
  if (!dashboardStore.layerId) {
    return;
  }
  const json = await selectorStore.fetchServices(dashboardStore.layerId);
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  states.currentService = selectorStore.currentService.value;
  fetchPods(dashboardStore.entity);
}

async function changeService(service: Service[]) {
  if (service[0]) {
    states.currentService = service[0].value;
    selectorStore.setCurrentService(service[0]);
    fetchPods(dashboardStore.entity);
  } else {
    selectorStore.setCurrentService("");
  }
}

function changePods(pod: Option[]) {
  if (pod[0]) {
    selectorStore.setCurrentPod(pod[0].value);
  } else {
    selectorStore.setCurrentPod("");
  }
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

async function fetchPods(type: string) {
  let resp;
  switch (type) {
    case "Endpoint":
      resp = await selectorStore.getEndpoints();
      states.currentPod = selectorStore.currentPod.label;
      break;
    case "ServiceInstance":
      resp = await selectorStore.getServiceInstances();
      states.currentPod = selectorStore.currentPod.label;
      break;
    default:
      resp = {};
  }
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
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
