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
  <div class="tool">
    <span v-show="dashboardStore.entity === EntityType[2].value && config.graph && config.graph.showDepth">
      <span class="label">{{ t("currentDepth") }}</span>
      <Selector
        class="inputs"
        :value="depth"
        :options="DepthList"
        placeholder="Select a option"
        @change="changeDepth"
        size="small"
      />
    </span>
    <span class="switch-icon ml-5" title="Settings" @click="setConfig" v-if="dashboardStore.editMode">
      <Icon size="middle" iconName="settings" />
    </span>
    <span class="switch-icon ml-5" title="Back to overview topology" @click="backToTopology">
      <Icon size="middle" iconName="keyboard_backspace" />
    </span>
    <div class="settings" v-if="showSettings">
      <Settings @update="updateConfig" />
    </div>
  </div>
  <div
    class="sankey"
    :style="`height:${height - 30}px;width:${width}px;`"
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0)"
    @click="handleClick"
  >
    <Sankey @click="selectNodeLink" :settings="settings" />
  </div>
  <div
    class="operations-list"
    v-if="topologyStore.node"
    :style="{
      top: operationsPos.y + 'px',
      left: operationsPos.x + 'px',
    }"
  >
    <i v-for="(item, index) of items" :key="index" @click="item.func">
      <span v-if="['alarm', 'inspect'].includes(item.id) || (item.id === 'dashboard' && settings.nodeDashboard)">
        {{ item.title }}
      </span>
    </i>
  </div>
</template>
<script lang="ts" setup>
  import { watch } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { ref, onMounted, reactive } from "vue";
  import type { Option } from "@/types/app";
  import { useTopologyStore } from "@/store/modules/topology";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { EntityType, DepthList, MetricModes, CallTypes } from "@/views/dashboard/data";
  import { ElMessage } from "element-plus";
  import Sankey from "./Sankey.vue";
  import Settings from "../config/Settings.vue";
  import router from "@/router";
  import getDashboard from "@/hooks/useDashboardsSession";

  /*global defineProps */
  const props = defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
  });
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();
  const topologyStore = useTopologyStore();
  const appStore = useAppStoreWithOut();
  const loading = ref<boolean>(false);
  const height = ref<number>(100);
  const width = ref<number>(100);
  const showSettings = ref<boolean>(false);
  const settings = ref<any>(props.config);
  const operationsPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });
  const depth = ref<number>((props.config.graph && props.config.graph.depth) || 3);
  const items = [
    { id: "inspect", title: "Inspect", func: inspect },
    { id: "dashboard", title: "View Dashboard", func: goDashboard },
    { id: "alarm", title: "View Alarm", func: goAlarm },
  ];

  onMounted(() => {
    loadTopology(selectorStore.currentPod && selectorStore.currentPod.id);
    window.addEventListener("resize", resize);
  });

  async function loadTopology(id?: string) {
    loading.value = true;
    const resp = await getTopology(id);
    loading.value = false;
    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
    const dom = document.querySelector(".topology")?.getBoundingClientRect() || {
      height: 70,
      width: 5,
    };
    height.value = dom.height - 70;
    width.value = dom.width - 5;
    if (settings.value.metricMode === MetricModes.Expression) {
      topologyStore.queryNodeExpressions(settings.value.nodeExpressions || []);
      topologyStore.getLinkExpressions(settings.value.linkClientExpressions || [], CallTypes.Client);
      topologyStore.getLinkExpressions(settings.value.linkServerExpressions || [], CallTypes.Server);
    } else {
      topologyStore.getLinkClientMetrics(settings.value.linkClientMetrics || []);
      topologyStore.getLinkServerMetrics(settings.value.linkServerMetrics || []);
      topologyStore.queryNodeMetrics(settings.value.nodeMetrics || []);
    }
  }

  function resize() {
    const dom = document.querySelector(".topology")?.getBoundingClientRect() || {
      height: 40,
      width: 0,
    };
    height.value = dom.height - 40;
    width.value = dom.width;
  }

  function inspect() {
    const id = topologyStore.node.id;
    topologyStore.setNode(null);
    topologyStore.setLink(null);
    loadTopology(id);
  }

  function goAlarm() {
    const path = `/alarm`;
    const routeUrl = router.resolve({ path });

    window.open(routeUrl.href, "_blank");
    topologyStore.setNode(null);
  }
  function goDashboard() {
    const entity = dashboardStore.entity === EntityType[2].value ? EntityType[2].value : EntityType[3].value;
    const { dashboard } = getDashboard({
      name: settings.value.nodeDashboard,
      layer: dashboardStore.layerId,
      entity,
    });
    if (!dashboard) {
      ElMessage.error(`The dashboard named ${settings.value.nodeDashboard} doesn't exist`);
      return;
    }
    const path = `/dashboard/${dashboard.layer}/${entity}/${topologyStore.node.serviceId}/${topologyStore.node.id}/${dashboard.name}`;
    const routeUrl = router.resolve({ path });
    window.open(routeUrl.href, "_blank");
    topologyStore.setNode(null);
  }

  function setConfig() {
    topologyStore.setNode(null);
    showSettings.value = !showSettings.value;
    dashboardStore.selectWidget(props.config);
  }

  function updateConfig(config: any) {
    settings.value = config;
  }

  function backToTopology() {
    loadTopology(selectorStore.currentPod.id);
    topologyStore.setNode(null);
  }

  function selectNodeLink(d: any) {
    if (d.dataType === "edge") {
      topologyStore.setNode(null);
      topologyStore.setLink(d.data);
      if (!settings.value.linkDashboard) {
        return;
      }
      const { sourceObj, targetObj } = d.data;
      const entity = dashboardStore.entity === EntityType[2].value ? EntityType[6].value : EntityType[5].value;
      const { dashboard } = getDashboard({
        name: settings.value.linkDashboard,
        layer: dashboardStore.layerId,
        entity,
      });
      if (!dashboard) {
        ElMessage.error(`The dashboard named ${settings.value.linkDashboard} doesn't exist`);
        return;
      }
      const path = `/dashboard/${dashboard.layer}/${entity}/${sourceObj.serviceId}/${sourceObj.id}/${targetObj.serviceId}/${targetObj.id}/${dashboard.name}`;
      const routeUrl = router.resolve({ path });
      window.open(routeUrl.href, "_blank");
      return;
    }
    topologyStore.setNode(d.data);
    topologyStore.setLink(null);
    operationsPos.x = d.event.event.clientX - 200;
    operationsPos.y = d.event.event.clientY - 150;
  }

  async function changeDepth(opt: Option[] | any) {
    depth.value = opt[0].value;
    loadTopology(selectorStore.currentPod.id);
  }

  async function getTopology(id?: string) {
    let resp;
    switch (dashboardStore.entity) {
      case EntityType[2].value:
        resp = await topologyStore.updateEndpointTopology([id], Number(depth.value));
        break;
      case EntityType[5].value:
        resp = await topologyStore.getInstanceTopology();
        break;
      case EntityType[4].value:
        resp = await topologyStore.getInstanceTopology();
        break;
    }
    return resp;
  }
  function handleClick(event: any) {
    if (event.target.nodeName === "svg") {
      topologyStore.setNode(null);
      topologyStore.setLink(null);
      dashboardStore.selectWidget(props.config);
    }
  }
  watch(
    () => [selectorStore.currentPod],
    () => {
      loadTopology(selectorStore.currentPod.id);
      topologyStore.setNode(null);
      topologyStore.setLink(null);
    },
  );
  watch(
    () => [selectorStore.currentService, selectorStore.currentDestService],
    () => {
      if (dashboardStore.entity !== EntityType[4].value) {
        return;
      }
      loadTopology();
      topologyStore.setNode(null);
      topologyStore.setLink(null);
    },
  );
  watch(
    () => appStore.durationTime,
    () => {
      loadTopology(selectorStore.currentPod.id);
      topologyStore.setNode(null);
      topologyStore.setLink(null);
    },
  );
</script>
<style lang="scss" scoped>
  .sankey {
    margin-top: 10px;
    color: #ddd;
  }

  .settings {
    position: absolute;
    top: 60px;
    right: 10px;
    width: 400px;
    height: 600px;
    border: 1px solid $border-color-primary;
    overflow: auto;
    padding: 10px 15px;
    border-radius: 3px;
    color: $disabled-color;
    background-color: var(--sw-topology-setting-bg);
    box-shadow: var(--sw-topology-box-shadow);
    transition: all 0.5ms linear;
    z-index: 99;
    text-align: left;
  }

  .tool {
    text-align: right;
    margin-top: 40px;
    margin-right: 10px;
    position: relative;
  }

  .switch-icon {
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.5ms linear;
    background: var(--sw-topology-switch-icon);
    color: $text-color;
    display: inline-block;
    border-radius: 3px;
  }

  .label {
    color: $disabled-color;
    display: inline-block;
    margin-right: 5px;
  }

  .operations-list {
    position: absolute;
    padding: 10px 0;
    color: $font-color;
    cursor: pointer;
    background-color: $theme-background;
    border-radius: 3px;

    span {
      display: block;
      height: 30px;
      width: 140px;
      line-height: 30px;
      text-align: left;
      padding: 0 15px;
    }

    span:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }

    i {
      font-style: normal;
    }
  }
</style>
