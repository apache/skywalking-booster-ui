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
      <div class="selectors-item" v-if="key !== 10">
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
      <div class="selectors-item" v-if="key === 3 || key === 4">
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
          @query="searchPods"
          class="selectorPod"
          :isRemote="
            ['EndpointRelation', 'Endpoint'].includes(dashboardStore.entity)
          "
        />
      </div>
      <div class="selectors-item" v-if="key === 2 || key === 4">
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
      <div class="selectors-item" v-if="key === 4">
        <span class="label">
          {{
            dashboardStore.entity === "EndpointRelation"
              ? "$DestinationEndpoint"
              : "$DestinationServiceInstance"
          }}
        </span>
        <Selector
          v-model="states.currentDestPod"
          :options="selectorStore.destPods"
          size="small"
          placeholder="Select a data"
          @change="changeDestPods"
          class="selectorPod"
          @query="searchDestPods"
          :isRemote="dashboardStore.entity === 'EndpointRelation'"
        />
      </div>
    </div>
    <div class="flex-h tools" v-loading="loading" v-if="!appStore.isMobile">
      <div class="tool-icons flex-h" v-if="dashboardStore.editMode">
        <el-dropdown content="Controls" placement="bottom" :persistent="false">
          <i>
            <Icon class="icon-btn" size="sm" iconName="control" />
          </i>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                @click="clickIcons(t)"
                v-for="(t, index) in toolIcons"
                :key="index"
                :title="t.content"
              >
                <Icon class="mr-5" size="middle" :iconName="t.name" />
                <span>{{ t.content }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip content="Apply" placement="bottom" effect="light">
          <i @click="applyDashboard">
            <Icon class="icon-btn" size="sm" iconName="save" />
          </i>
        </el-tooltip>
      </div>
      <div class="switch">
        <el-switch
          v-model="dashboardStore.editMode"
          active-text="Edit"
          inactive-text="View"
          size="small"
          inline-prompt
          active-color="#409eff"
          inactive-color="#999"
          @change="changeMode"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import {
  EntityType,
  AllTools,
  ServiceTools,
  InstanceTools,
  EndpointTools,
  EndpointRelationTools,
  InstanceRelationTools,
  ServiceRelationTools,
} from "../data";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import { Option } from "@/types/app";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const appStore = useAppStoreWithOut();
const params = useRoute().params;
const toolIcons = ref<{ name: string; content: string; id: string }[]>(
  EndpointRelationTools
);
const loading = ref<boolean>(false);
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
  key: 0,
  currentService: "",
  currentPod: "",
  currentDestService: "",
  currentDestPod: "",
});
const key = computed(() => {
  const type = EntityType.find(
    (d: Option) => d.value === dashboardStore.entity
  );
  return (type && type.key) || 0;
});

setCurrentDashboard();
appStore.setEventStack([initSelector]);
initSelector();

function initSelector() {
  getTools();
  if (params.serviceId) {
    setSelector();
  } else {
    getServices();
  }
}

function setCurrentDashboard() {
  if (params.layerId) {
    dashboardStore.setLayer(params.layerId);
    dashboardStore.setEntity(params.entity);
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
  if (states.currentService) {
    for (const d of selectorStore.services) {
      if (d.value === states.currentService) {
        currentService = d;
      }
      if (d.value === states.currentDestService) {
        currentDestService = d;
      }
    }
  } else {
    for (const d of selectorStore.services) {
      if (d.id === String(params.serviceId)) {
        currentService = d;
      }
      if (d.id === String(params.destServiceId)) {
        currentDestService = d;
      }
    }
  }
  selectorStore.setCurrentService(currentService);
  selectorStore.setCurrentDestService(currentDestService);
  states.currentService =
    selectorStore.currentService && selectorStore.currentService.value;
  states.currentDestService =
    selectorStore.currentDestService && selectorStore.currentDestService.value;
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
  let currentPod;
  if (states.currentPod) {
    currentPod = selectorStore.pods.find(
      (d: { label: string }) => d.label === states.currentPod
    );
  } else {
    currentPod = selectorStore.pods.find((d: { id: string }) => d.id === pod);
  }
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
  let currentDestPod = { label: "" };
  if (states.currentDestPod) {
    currentDestPod = selectorStore.pods.find(
      (d: { label: string }) => d.label === states.currentDestPod
    );
  } else {
    currentDestPod = selectorStore.destPods.find(
      (d: { id: string }) => d.id === destPod
    );
  }
  if (currentDestPod) {
    selectorStore.setCurrentDestPod(currentDestPod);
    states.currentDestPod = currentDestPod.label;
  }
}

async function getServices() {
  if (!dashboardStore.entity) {
    return;
  }
  if (!dashboardStore.layerId) {
    return;
  }
  if (dashboardStore.entity === EntityType[1].value) {
    return;
  }
  const json = await selectorStore.fetchServices(dashboardStore.layerId);
  if (json.errors) {
    ElMessage.error(json.errors);
    return;
  }
  let s;
  if (states.currentService) {
    s = (selectorStore.services || []).find(
      (d: { label: string }) => d.label === states.currentService
    );
  } else {
    s = (selectorStore.services || []).find(
      (d: unknown, index: number) => index === 0
    );
  }
  selectorStore.setCurrentService(s || null);
  let d;
  if (states.currentService) {
    d = (selectorStore.services || []).find(
      (d: { label: string }) => d.label === states.currentDestService
    );
  } else {
    d = (selectorStore.services || []).find(
      (d: unknown, index: number) => index === 1
    );
  }
  selectorStore.setCurrentDestService(d || null);
  if (!selectorStore.currentService) {
    return;
  }
  states.currentService = selectorStore.currentService.value;
  const e = dashboardStore.entity.split("Relation")[0];
  if (
    [
      EntityType[2].value,
      EntityType[3].value,
      EntityType[5].value,
      EntityType[6].value,
    ].includes(dashboardStore.entity)
  ) {
    fetchPods(e, selectorStore.currentService.id, true);
  }
  if (!selectorStore.currentDestService) {
    return;
  }
  states.currentDestService = selectorStore.currentDestService.value;
  if (
    [EntityType[5].value, EntityType[6].value].includes(dashboardStore.entity)
  ) {
    fetchPods(dashboardStore.entity, selectorStore.currentDestService.id, true);
  }
}

async function changeService(service: any) {
  if (service[0]) {
    states.currentService = service[0].value;
    selectorStore.setCurrentService(service[0]);
    const e = dashboardStore.entity.split("Relation")[0];
    selectorStore.setCurrentPod(null);
    states.currentPod = "";
    fetchPods(e, selectorStore.currentService.id, true);
  } else {
    selectorStore.setCurrentService(null);
  }
}

function changeDestService(service: any) {
  if (service[0]) {
    states.currentDestService = service[0].value;
    selectorStore.setCurrentDestService(service[0]);
    selectorStore.setCurrentDestPod(null);
    states.currentDestPod = "";
    fetchPods(dashboardStore.entity, selectorStore.currentDestService.id, true);
  } else {
    selectorStore.setCurrentDestService(null);
  }
}

function changePods(pod: any) {
  if (pod[0]) {
    selectorStore.setCurrentPod(pod[0]);
  } else {
    selectorStore.setCurrentPod("");
  }
}

function changeDestPods(pod: any) {
  if (pod[0]) {
    selectorStore.setCurrentDestPod(pod[0]);
  } else {
    selectorStore.setCurrentDestPod(null);
  }
}

function changeMode() {
  if (dashboardStore.editMode) {
    ElMessage.warning(t("editWarning"));
    return;
  }
  ElMessage.warning(t("viewWarning"));
}

async function applyDashboard() {
  loading.value = true;
  await dashboardStore.saveDashboard();
  loading.value = false;
}

async function clickIcons(t: { id: string; content: string; name: string }) {
  if (
    dashboardStore.selectedGrid &&
    dashboardStore.selectedGrid.type === "Tab"
  ) {
    setTabControls(t.id);
    return;
  }
  if (dashboardStore.activedGridItem.split("-").length === 3) {
    setTabControls(t.id);
    return;
  }
  setControls(t.id);
}

function setTabControls(id: string) {
  switch (id) {
    case "addWidget":
      dashboardStore.addTabControls("Widget");
      break;
    case "addTrace":
      dashboardStore.addTabControls("Trace");
      break;
    case "addLog":
      dashboardStore.addTabControls("Log");
      break;
    case "addProfile":
      dashboardStore.addTabControls("Profile");
      break;
    case "addEbpf":
      dashboardStore.addTabControls("Ebpf");
      break;
    case "addTopology":
      dashboardStore.addTabControls("Topology");
      break;
    case "addText":
      dashboardStore.addTabControls("Text");
      break;
    case "addDemandLog":
      dashboardStore.addTabControls("DemandLog");
      break;
    default:
      ElMessage.info("Don't support this control");
      break;
  }
}

function setControls(id: string) {
  switch (id) {
    case "addWidget":
      dashboardStore.addControl("Widget");
      break;
    case "addTab":
      dashboardStore.addControl("Tab");
      break;
    case "addTrace":
      dashboardStore.addControl("Trace");
      break;
    case "addProfile":
      dashboardStore.addControl("Profile");
      break;
    case "addEbpf":
      dashboardStore.addControl("Ebpf");
      break;
    case "addLog":
      dashboardStore.addControl("Log");
      break;
    case "addTopology":
      dashboardStore.addControl("Topology");
      break;
    case "addText":
      dashboardStore.addControl("Text");
      break;
    case "addDemandLog":
      dashboardStore.addControl("DemandLog");
      break;
    default:
      dashboardStore.addControl("Widget");
  }
}

async function fetchPods(
  type: string,
  serviceId: string,
  setPod: boolean,
  param?: { keyword?: string }
) {
  let resp;
  switch (type) {
    case EntityType[2].value:
      resp = await selectorStore.getEndpoints({ serviceId, ...param });
      if (setPod) {
        let p;
        if (states.currentPod) {
          p = selectorStore.pods.find(
            (d: { label: unknown }) => d.label === states.currentPod
          );
        } else {
          p = selectorStore.pods.find(
            (d: unknown, index: number) => index === 0
          );
        }
        selectorStore.setCurrentPod(p || null);
        states.currentPod = selectorStore.currentPod.label;
      }
      break;
    case EntityType[3].value:
      resp = await selectorStore.getServiceInstances({ serviceId });
      if (setPod) {
        let p;
        if (states.currentPod) {
          p = selectorStore.pods.find(
            (d: { label: string }) => d.label === states.currentPod
          );
        } else {
          p = selectorStore.pods.find(
            (d: { label: string }, index: number) => index === 0
          );
        }
        selectorStore.setCurrentPod(p || null);
        states.currentPod = selectorStore.currentPod.label;
      }
      break;
    case EntityType[6].value:
      resp = await selectorStore.getEndpoints({
        serviceId,
        isRelation: true,
        ...param,
      });
      if (setPod) {
        let p;
        if (states.currentDestPod) {
          p = selectorStore.destPods.find(
            (d: { label: string }) => d.label === states.currentDestPod
          );
        } else {
          p = selectorStore.destPods.find(
            (d: { label: string }, index: number) => index === 0
          );
        }
        selectorStore.setCurrentDestPod(p || null);
        states.currentDestPod = selectorStore.currentDestPod.label;
      }
      break;
    case EntityType[5].value:
      resp = await selectorStore.getServiceInstances({
        serviceId,
        isRelation: true,
      });
      if (setPod) {
        let p;
        if (states.currentDestPod) {
          p = selectorStore.destPods.find(
            (d: { label: string }) => d.label === states.currentDestPod
          );
        } else {
          p = selectorStore.destPods.find(
            (d: { label: string }, index: number) => index === 0
          );
        }
        selectorStore.setCurrentDestPod(p || null);
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
function getTools() {
  switch (params.entity) {
    case EntityType[1].value:
      toolIcons.value = AllTools;
      break;
    case EntityType[0].value:
      toolIcons.value = ServiceTools;
      break;
    case EntityType[2].value:
      toolIcons.value = EndpointTools;
      break;
    case EntityType[3].value:
      toolIcons.value = InstanceTools;
      break;
    case EntityType[4].value:
      toolIcons.value = ServiceRelationTools;
      break;
    case EntityType[5].value:
      toolIcons.value = InstanceRelationTools;
      break;
    case EntityType[6].value:
      toolIcons.value = EndpointRelationTools;
      break;
    default:
      toolIcons.value = EndpointRelationTools;
  }
}
function searchPods(query: string) {
  const param = {
    keyword: query,
  };
  fetchPods(EntityType[2].value, selectorStore.currentService.id, false, param);
}
function searchDestPods(query: string) {
  const param = {
    keyword: query,
  };
  fetchPods(
    EntityType[6].value,
    selectorStore.currentDestService.id,
    false,
    param
  );
}
watch(
  () => dashboardStore.entity,
  (newVal, oldVal) => {
    if (newVal === oldVal) {
      return;
    }
    getServices();
  }
);
</script>
<style lang="scss" scoped>
.dashboard-tool {
  text-align: right;
  padding: 3px 5px 5px 5px;
  background: rgb(240, 242, 245);
  border-bottom: 1px solid #dfe4e8;
  justify-content: space-between;
}

.switch {
  padding-top: 2px;
  margin: 0 10px;
}

.label {
  font-size: 12px;
  display: inline-block;
  padding: 4px 2px;
}

.tool-icons {
  margin-top: 2px;
}

.tools {
  justify-content: space-between;
  height: auto;
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
  width: 300px;
}
</style>
