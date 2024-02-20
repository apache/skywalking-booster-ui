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
    <div :class="isRelation ? 'flex-v' : 'flex-h'" class="tool-selectors">
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
          <span class="ml-5 cp hierarchy-btn" v-if="dashboardStore.entity === 'Service'" @click="viewTopology">
            <Icon size="small" iconName="hierarchy_topology" />
          </span>
        </div>
        <div class="selectors-item" v-if="key === 3 || key === 4 || key === 5 || key === 6">
          <span class="label">
            {{ ["EndpointRelation", "Endpoint"].includes(dashboardStore.entity) ? "$Endpoint" : "$ServiceInstance" }}
          </span>
          <Selector
            v-model="states.currentPod"
            :options="selectorStore.pods"
            size="small"
            placeholder="Select a data"
            @change="changePods"
            @query="searchPods"
            class="selectorPod"
            :isRemote="['EndpointRelation', 'Endpoint'].includes(dashboardStore.entity)"
          />
          <span
            class="ml-5 cp hierarchy-btn"
            v-if="dashboardStore.entity === 'ServiceInstance'"
            @click="showHierarchy = true"
          >
            <Icon size="small" iconName="hierarchy_topology" />
          </span>
        </div>
        <div class="selectors-item" v-if="key === 5 || key === 6">
          <span class="label"> $Process </span>
          <Selector
            v-model="states.currentProcess"
            :options="selectorStore.processes"
            size="small"
            placeholder="Select a data"
            @change="changeProcess"
            class="selectors"
          />
        </div>
      </div>
      <div class="flex-h" :class="isRelation ? 'relation' : ''">
        <div class="selectors-item" v-if="key === 2 || key === 4 || key === 5">
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
        <div class="selectors-item" v-if="key === 4 || key === 5">
          <span class="label">
            {{ dashboardStore.entity === "EndpointRelation" ? "$DestinationEndpoint" : "$DestinationServiceInstance" }}
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
        <div class="selectors-item" v-if="key === 5">
          <span class="label"> $DestinationProcess </span>
          <Selector
            v-model="states.currentDestProcess"
            :options="selectorStore.destProcesses"
            size="small"
            placeholder="Select a data"
            @change="changeDestProcess"
            class="selectors"
          />
        </div>
      </div>
    </div>
    <div class="flex-h tools" v-loading="loading" v-if="!appStore.isMobile">
      <div class="tool-icons" v-if="dashboardStore.editMode">
        <el-dropdown content="Controls" placement="bottom" :persistent="false">
          <i>
            <Icon class="icon-btn" size="sm" iconName="control" />
          </i>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="clickIcons(t)" v-for="(t, index) in toolIcons" :key="index" :title="t.content">
                <Icon class="mr-5" size="sm" :iconName="t.name" />
                <span>{{ t.content }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip content="Apply" placement="bottom">
          <i @click="applyDashboard">
            <Icon class="icon-btn" size="sm" iconName="save" />
          </i>
        </el-tooltip>
      </div>
      <div class="ml-5">
        <el-switch
          v-model="dashboardStore.editMode"
          active-text="E"
          inactive-text="V"
          inline-prompt
          @change="changeMode"
        />
      </div>
    </div>
  </div>
  <el-dialog v-model="showHierarchy" :destroy-on-close="true" @closed="showHierarchy = false" width="640px">
    <div class="hierarchy-related">
      <instance-map v-if="dashboardStore.entity === 'ServiceInstance'" />
      <hierarchy-map v-else />
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed, watch } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
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
    ProcessTools,
    ProcessRelationTools,
    WidgetType,
  } from "@/views/dashboard/data";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useTopologyStore } from "@/store/modules/topology";
  import { ElMessage } from "element-plus";
  import type { Option } from "@/types/app";
  import InstanceMap from "@/views/dashboard/related/topology/pod/InstanceMap.vue";
  import HierarchyMap from "@/views/dashboard/related/topology/service/HierarchyMap.vue";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();
  const topologyStore = useTopologyStore();
  const appStore = useAppStoreWithOut();
  const params = useRoute().params;
  const toolIcons = ref<{ name: string; content: string; id: WidgetType }[]>(AllTools);
  const loading = ref<boolean>(false);
  const showHierarchy = ref<boolean>(false);
  const states = reactive<{
    destService: string;
    destPod: string;
    key: number;
    currentService: string;
    currentPod: string;
    currentProcess: string;
    currentDestService: string;
    currentDestPod: string;
    currentDestProcess: string;
  }>({
    destService: "",
    destPod: "",
    key: 0,
    currentService: "",
    currentPod: "",
    currentProcess: "",
    currentDestService: "",
    currentDestPod: "",
    currentDestProcess: "",
  });
  const key = computed(() => {
    const type = EntityType.find((d: Option) => d.value === dashboardStore.entity);
    return (type && type.key) || 0;
  });

  const isRelation = computed(() => {
    return [EntityType[7].value, EntityType[6].value, EntityType[5].value].includes(dashboardStore.entity);
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
        EntityType[7].value,
        EntityType[8].value,
      ].includes(String(params.entity))
    ) {
      setSourceSelector();
      if ([EntityType[2].value, EntityType[3].value, EntityType[8].value].includes(String(params.entity))) {
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
    states.currentService = selectorStore.currentService && selectorStore.currentService.value;
    states.currentDestService = selectorStore.currentDestService && selectorStore.currentDestService.value;
  }

  async function setSourceSelector() {
    await selectorStore.getService(String(params.serviceId));
    states.currentService = selectorStore.currentService.value;
    const e = String(params.entity).split("Relation")[0];

    await fetchPods(e, selectorStore.currentService.id, true);
  }

  async function setDestSelector() {
    await selectorStore.getService(String(params.destServiceId), true);
    states.currentDestService = selectorStore.currentDestService.value;
    await fetchPods(String(params.entity), selectorStore.currentDestService.id, true);
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
      s = (selectorStore.services || []).find((d: { label: string }) => d.label === states.currentService);
    } else {
      s = (selectorStore.services || []).find((d: unknown, index: number) => index === 0);
    }
    selectorStore.setCurrentService(s || null);
    let d,
      val = 1;
    if (key.value === 5) {
      val = 0;
    }
    if (states.currentService) {
      d = (selectorStore.services || []).find((d: { label: string }) => d.label === states.currentDestService);
    } else {
      d = (selectorStore.services || []).find((d: unknown, index: number) => index === val);
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
        EntityType[7].value,
        EntityType[8].value,
      ].includes(dashboardStore.entity)
    ) {
      await fetchPods(e, selectorStore.currentService.id, true);
    }
    if (!selectorStore.currentDestService) {
      return;
    }
    states.currentDestService = selectorStore.currentDestService.value;
    if ([EntityType[5].value, EntityType[6].value, EntityType[7].value].includes(dashboardStore.entity)) {
      await fetchPods(dashboardStore.entity, selectorStore.currentDestService.id, true);
    }
  }

  async function changeService(service: Option[]) {
    if (service[0]) {
      states.currentService = service[0].value;
      selectorStore.setCurrentService(service[0]);
      selectorStore.setCurrentPod(null);
      states.currentPod = "";
      states.currentProcess = "";
      const e = dashboardStore.entity.split("Relation")[0];
      fetchPods(e, selectorStore.currentService.id, true);
    } else {
      selectorStore.setCurrentService(null);
    }
  }

  function changeDestService(service: Option[]) {
    if (service[0]) {
      states.currentDestService = service[0].value;
      selectorStore.setCurrentDestService(service[0]);
      selectorStore.setCurrentDestPod(null);
      states.currentDestPod = "";
      states.currentDestProcess = "";
      fetchPods(dashboardStore.entity, selectorStore.currentDestService.id, true);
    } else {
      selectorStore.setCurrentDestService(null);
    }
  }

  async function changePods(pod: Option[]) {
    selectorStore.setCurrentPod(pod[0] || null);
    if ([EntityType[7].value, EntityType[8].value].includes(dashboardStore.entity)) {
      fetchProcess(true);
    }
  }

  function changeDestPods(pod: Option[]) {
    selectorStore.setCurrentDestPod(pod[0] || null);
    if (dashboardStore.entity === EntityType[7].value) {
      selectorStore.setCurrentDestProcess(null);
      states.currentDestProcess = "";
      fetchDestProcess(true);
    }
  }

  function changeDestProcess(pod: Option[]) {
    selectorStore.setCurrentDestProcess(pod[0] || null);
    states.currentDestProcess = pod[0].label || "";
  }

  function changeProcess(pod: Option[]) {
    selectorStore.setCurrentProcess(pod[0] || null);
    states.currentProcess = pod[0].label || "";
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

  async function clickIcons(t: { id: WidgetType; content: string; name: string }) {
    if (dashboardStore.selectedGrid && dashboardStore.selectedGrid.type === "Tab") {
      setTabControls(t.id);
      return;
    }
    if (dashboardStore.activedGridItem.split("-").length === 3) {
      setTabControls(t.id);
      return;
    }
    setControls(t.id);
  }

  function setTabControls(id: WidgetType) {
    if (!WidgetType[id]) {
      ElMessage.info("Don't support this control");
      return;
    }
    dashboardStore.addTabControls(id);
  }

  function setControls(id: WidgetType) {
    if (!WidgetType[id]) {
      ElMessage.info("Don't support this control");
      return;
    }
    dashboardStore.addControl(id);
  }

  async function fetchPods(type: string, serviceId: string, setPod: boolean, param?: { keyword?: string }) {
    let resp;
    switch (type) {
      case EntityType[2].value:
        if (params.podId) {
          if (setPod) {
            await setCurrentEndpoint();
          }
          resp = await selectorStore.getEndpoints({ serviceId, ...param });
        } else {
          resp = await selectorStore.getEndpoints({ serviceId, ...param });
          if (setPod) {
            updateCurrentPod();
          }
        }
        break;
      case EntityType[3].value:
        resp = await selectorStore.getServiceInstances({ serviceId });
        if (setPod) {
          updateCurrentPod();
        }
        break;
      case EntityType[6].value:
        if (params.destPodId) {
          if (setPod) {
            await updateCurrentDestEndpoint();
          }
          resp = await selectorStore.getEndpoints({
            serviceId,
            isRelation: true,
            ...param,
          });
        } else {
          resp = await selectorStore.getEndpoints({
            serviceId,
            isRelation: true,
            ...param,
          });
          if (setPod) {
            updateCurrentDestPod();
          }
        }
        break;
      case EntityType[5].value:
        resp = await selectorStore.getServiceInstances({
          serviceId,
          isRelation: true,
        });
        if (setPod) {
          updateCurrentDestPod();
        }
        break;
      case EntityType[7].value:
        await fetchPods(EntityType[5].value, serviceId, setPod, param);
        resp = await fetchDestProcess(setPod);
        break;
      case EntityType[8].value:
        await fetchPods(EntityType[3].value, serviceId, setPod, param);
        resp = await fetchProcess(setPod);
        break;
      default:
        resp = {};
    }
    if (resp.errors) {
      ElMessage.error(resp.errors);
    }
  }

  async function fetchProcess(setPod: boolean) {
    const resp = await selectorStore.getProcesses({
      instanceId: selectorStore.currentPod.id,
    });
    if (setPod) {
      const process = params.processId || selectorStore.processes[0].id;
      const currentProcess = selectorStore.processes.find((d: { id: string }) => d.id === process);
      if (currentProcess) {
        selectorStore.setCurrentProcess(currentProcess);
        states.currentProcess = currentProcess.label;
      } else {
        selectorStore.setCurrentProcess(null);
        states.currentProcess = "";
      }
    }
    return resp;
  }
  async function fetchDestProcess(setPod: boolean) {
    const resp = await selectorStore.getProcesses({
      instanceId: selectorStore.currentDestPod.id,
      isRelation: true,
    });
    if (setPod) {
      const destProcess = params.destProcessId || selectorStore.destProcesses[0].id;
      const currentDestProcess = selectorStore.destProcesses.find((d: { id: string }) => d.id === destProcess);
      if (!currentDestProcess) {
        states.currentDestProcess = "";
        selectorStore.setCurrentDestProcess(null);
        return;
      }
      selectorStore.setCurrentDestProcess(currentDestProcess);
      states.currentDestProcess = currentDestProcess.label;
    }
    return resp;
  }
  async function updateCurrentDestEndpoint() {
    const resp = await selectorStore.getEndpoint(params.destPodId, true);

    if (resp.errors) {
      return ElMessage.error(resp.errors);
    }
    const pod = resp.data.endpoint || {};
    if (!pod.id) {
      ElMessage.info("The Destination endpoint ID doesn't exist.");
    }
    selectorStore.setCurrentDestPod(pod);
    states.currentDestPod = pod.label;
  }

  function updateCurrentDestPod() {
    if (!(selectorStore.destPods.length && selectorStore.destPods[0])) {
      selectorStore.setCurrentDestPod(null);
      states.currentDestPod = "";
      return;
    }
    const destPod = params.destPodId || selectorStore.destPods[0].id;
    const currentDestPod = selectorStore.destPods.find((d: { id: string }) => d.id === destPod);
    if (!currentDestPod) {
      states.currentDestPod = "";
      selectorStore.setCurrentDestPod(null);
      ElMessage.info(
        `The Destination ${params.entity === EntityType[6].value ? "endpoint" : "instance"} ID doesn't exist.`,
      );
      return;
    }
    selectorStore.setCurrentDestPod(currentDestPod);
    states.currentDestPod = currentDestPod.label;
  }
  async function setCurrentEndpoint() {
    const resp = await selectorStore.getEndpoint(params.podId);

    if (resp.errors) {
      return ElMessage.error(resp.errors);
    }
    const pod = resp.data.endpoint || {};
    if (!pod.id) {
      ElMessage.info("The endpoint ID doesn't exist.");
    }
    selectorStore.setCurrentPod(pod);
    states.currentPod = pod.label || "";
  }
  function updateCurrentPod() {
    if (!(selectorStore.pods.length && selectorStore.pods[0])) {
      selectorStore.setCurrentPod(null);
      states.currentPod = "";
      return;
    }
    const pod = params.podId || selectorStore.pods[0].id;
    const currentPod = selectorStore.pods.find((d: { id: string }) => d.id === pod);
    if (!currentPod) {
      selectorStore.setCurrentPod(null);
      states.currentPod = "";
      ElMessage.info(`The ${params.entity === EntityType[2].value ? "endpoint" : "instance"} ID doesn't exist.`);
      return;
    }
    selectorStore.setCurrentPod(currentPod);
    states.currentPod = currentPod.label;
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
      case EntityType[7].value:
        toolIcons.value = ProcessRelationTools;
        break;
      case EntityType[8].value:
        toolIcons.value = ProcessTools;
        break;
      default:
        toolIcons.value = AllTools;
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
    fetchPods(EntityType[6].value, selectorStore.currentDestService.id, false, param);
  }
  function viewTopology() {
    showHierarchy.value = true;
    topologyStore.setNode(null);
  }
  watch(
    () => dashboardStore.entity,
    (newVal, oldVal) => {
      if (newVal === oldVal) {
        return;
      }
      getServices();
    },
  );
</script>
<style lang="scss" scoped>
  .dashboard-tool {
    text-align: right;
    padding: 5px;
    background: $dashboard-tool-bg-color;
    border-bottom: 1px solid $border-color;
    justify-content: space-between;
  }

  .tool-selectors {
    align-items: center;
    height: auto;
  }

  .label {
    font-size: $font-size-smaller;
    display: inline-block;
    padding: 4px 2px;
  }

  .tool-icons {
    margin-top: 2px;
  }

  .tools {
    justify-content: space-between;
    align-items: center;
    height: auto;
  }

  .icon-btn {
    display: inline-block;
    padding: 3px;
    text-align: center;
    border: 1px solid var(--sw-icon-btn-border);
    border-radius: 3px;
    margin-left: 6px;
    cursor: pointer;
    background-color: var(--sw-icon-btn-bg);
    color: var(--sw-icon-btn-color);
    font-size: $font-size-smaller;
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

  .relation {
    margin-top: 5px;
  }

  .hierarchy-btn {
    display: inline-block;
    padding: 0 2px 2px;
    border: 1px solid #666;
    border-radius: 4px;
    text-align: center;
    color: #aaa;
  }

  .hierarchy-related {
    height: 600px;
    width: 600px;
    overflow: hidden;
  }
</style>
