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
      <div class="selectors-item" v-if="states.key !== 10">
        <span class="label">$Service</span>
        <Selector
          v-model="states.currentService"
          :options="selectorStore.services"
          size="small"
          placeholder="Select a service"
          @change="changeService"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 3 || states.key === 4">
        <span class="label">
          {{
            ["EndpointRelation", "Endpoint"].includes(dashboardStore.entity)
              ? "$Endpoint"
              : "$ServiceInstance"
          }}
        </span>
        <Selector
          v-model="states.currentPod"
          :options="selectorStore.pods"
          size="small"
          placeholder="Select a data"
          @change="changePods"
          class="selectorPod"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 2 || states.key === 4">
        <span class="label">$DestinationService</span>
        <Selector
          v-model="states.currentDestService"
          :options="selectorStore.destServices"
          size="small"
          placeholder="Select a service"
          @change="changeDestService"
          class="selectors"
        />
      </div>
      <div class="selectors-item" v-if="states.key === 4">
        <span class="label">
          {{
            dashboardStore.entity === "EndpointRelation"
              ? "$DestinationEndpoint"
              : "$DestinationServiceInstance"
          }}</span
        >
        <Selector
          v-model="states.currentDestPod"
          :options="selectorStore.destPods"
          size="small"
          placeholder="Select a data"
          @change="changePods"
          class="selectorPod"
        />
      </div>
    </div>
    <div class="tool-icons">
      <span
        @click="clickIcons(t)"
        v-for="(t, index) in ToolIcons"
        :key="index"
        :title="t.content"
      >
        <Icon
          class="icon-btn"
          size="sm"
          :iconName="t.name"
          v-if="
            !['topology', 'trace'].includes(t.id) ||
            (t.id === 'topology' &&
              hasTopology.includes(dashboardStore.entity)) ||
            (t.id === 'trace' && TraceEntitys.includes(dashboardStore.entity))
          "
        />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { EntityType, ToolIcons, hasTopology, TraceEntitys } from "../data";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import { Option } from "@/types/app";
import { Service } from "@/types/selector";

const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const appStore = useAppStoreWithOut();
const params = useRoute().params;
const type = EntityType.filter((d: Option) => d.value === params.entity)[0];
const states = reactive<{
  destService: string;
  destPod: string;
  key: number;
  currentService: string;
  currentPod: string;
  currentDestService: string;
  currentDestPod: string;
}>({
  destService: "",
  destPod: "",
  key: (type && type.key) || 0,
  currentService: "",
  currentPod: "",
  currentDestService: "",
  currentDestPod: "",
});

dashboardStore.setLayer(String(params.layerId));
dashboardStore.setEntity(String(params.entity));

initSelector();

function initSelector() {
  if (params.serviceId) {
    setSelector();
  } else {
    getServices();
  }
}

async function setSelector() {
  if (
    [
      EntityType[2].value,
      EntityType[3].value,
      EntityType[5].value,
      EntityType[6].value,
    ].includes(String(params.entity))
  ) {
    setSourceSelector();
    if (
      [EntityType[2].value, EntityType[3].value].includes(String(params.entity))
    ) {
      return;
    }
    setDestSelector();
    return;
  }
  // entity=Service/ServiceRelation
  const json = await selectorStore.fetchServices(dashboardStore.layerId);
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  let currentService, currentDestService;
  for (const d of selectorStore.services) {
    if (d.id === String(params.serviceId)) {
      currentService = d;
    }
    if (d.id === String(params.destServiceId)) {
      currentDestService = d;
    }
  }
  selectorStore.setCurrentService(currentService);
  selectorStore.setCurrentDestService(currentDestService);
  states.currentService = selectorStore.currentService.value;
  states.currentDestService = selectorStore.currentDestService.value;
}

async function setSourceSelector() {
  await selectorStore.getService(String(params.serviceId));
  states.currentService = selectorStore.currentService.value;
  const e = String(params.entity).split("Relation")[0];
  await fetchPods(e, selectorStore.currentService.id, false);
  if (!(selectorStore.pods.length && selectorStore.pods[0])) {
    selectorStore.setCurrentPod(null);
    states.currentPod = "";
    return;
  }
  const pod = params.podId || selectorStore.pods[0].id;
  const currentPod = selectorStore.pods.filter(
    (d: { id: string }) => d.id === pod
  )[0];
  if (currentPod) {
    selectorStore.setCurrentPod(currentPod);
    states.currentPod = currentPod.label;
  }
}

async function setDestSelector() {
  await selectorStore.getService(String(params.destServiceId), true);
  states.currentDestService = selectorStore.currentDestService.value;
  await fetchPods(
    String(params.entity),
    selectorStore.currentDestService.id,
    false
  );
  if (!(selectorStore.destPods.length && selectorStore.destPods[0])) {
    selectorStore.setCurrentDestPod(null);
    states.currentDestPod = "";
    return;
  }
  const destPod = params.destPodId || selectorStore.destPods[0].id;
  const currentDestPod = selectorStore.destPods.filter(
    (d: { id: string }) => d.id === destPod
  )[0];
  if (currentDestPod) {
    selectorStore.setCurrentDestPod(currentDestPod);
    states.currentDestPod = currentDestPod.label;
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
  if (dashboardStore.entity === EntityType[1].value) {
    return;
  }
  selectorStore.setCurrentService(
    selectorStore.services.length ? selectorStore.services[0] : null
  );
  selectorStore.setCurrentDestService(
    selectorStore.services.length ? selectorStore.services[1] : null
  );
  states.currentService = selectorStore.currentService.value;
  states.currentDestService = selectorStore.currentDestService.value;
  const e = dashboardStore.entity.split("Relation")[0];
  if (
    [EntityType[2].value, EntityType[3].value].includes(dashboardStore.entity)
  ) {
    fetchPods(e, selectorStore.currentService.id, true);
  }
  if (
    [EntityType[5].value, EntityType[6].value].includes(dashboardStore.entity)
  ) {
    fetchPods(dashboardStore.entity, selectorStore.currentDestService.id, true);
  }
}

async function changeService(service: Service[]) {
  if (service[0]) {
    states.currentService = service[0].value;
    selectorStore.setCurrentService(service[0]);
    fetchPods(dashboardStore.entity, selectorStore.currentService.id, true);
  } else {
    selectorStore.setCurrentService(null);
  }
}

function changeDestService(service: Service[]) {
  if (service[0]) {
    states.currentDestService = service[0].value;
    selectorStore.setCurrentDestService(service[0]);
  } else {
    selectorStore.setCurrentDestService(null);
  }
}

function changePods(pod: Option[]) {
  if (pod[0]) {
    selectorStore.setCurrentPod(pod[0]);
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
    case "trace":
      dashboardStore.addControl("Trace");
      break;
    case "topology":
      dashboardStore.addControl("Topology");
      break;
    case "settings":
      dashboardStore.setConfigPanel(true);
      break;
    default:
      dashboardStore.addControl("Widget");
  }
}

async function fetchPods(type: string, serviceId: string, setPod: boolean) {
  let resp;
  switch (type) {
    case EntityType[2].value:
      resp = await selectorStore.getEndpoints({ serviceId });
      if (setPod) {
        selectorStore.setCurrentPod(
          selectorStore.pods.length ? selectorStore.pods[0] : null
        );
        states.currentPod = selectorStore.currentPod.label;
      }
      break;
    case EntityType[3].value:
      resp = await selectorStore.getServiceInstances({ serviceId });
      if (setPod) {
        selectorStore.setCurrentPod(
          selectorStore.pods.length ? selectorStore.pods[0] : null
        );
        states.currentPod = selectorStore.currentPod.label;
      }
      break;
    case EntityType[6].value:
      resp = await selectorStore.getEndpoints({ serviceId, isRelation: true });
      if (setPod) {
        selectorStore.setCurrentDestPod(
          selectorStore.destPods.length ? selectorStore.destPods[0] : null
        );
        states.currentDestPod = selectorStore.currentDestPod.label;
      }
      break;
    case EntityType[5].value:
      resp = await selectorStore.getServiceInstances({
        serviceId,
        isRelation: true,
      });
      if (setPod) {
        selectorStore.setCurrentDestPod(
          selectorStore.destPods.length ? selectorStore.destPods[0] : null
        );
        states.currentDestPod = selectorStore.currentDestPod.label;
      }
      break;
    default:
      resp = {};
  }
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
}
watch(
  () => appStore.durationTime,
  () => {
    initSelector();
  }
);
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

.tool-icons {
  margin-top: 2px;
}

.icon-btn {
  display: inline-block;
  padding: 3px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-left: 6px;
  cursor: pointer;
  background-color: #eee;
  color: #666;
  font-size: 12px;
}

.selectors {
  min-width: 200px;
}

.selectors-item {
  margin-right: 5px;
}

.selectorPod {
  width: 340px;
}
</style>
