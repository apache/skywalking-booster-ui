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
    <span v-show="dashboardStore.entity === EntityType[2].value">
      <span class="label">{{ t("currentDepth") }}</span>
      <Selector
        class="inputs"
        :value="depth"
        :options="depthList"
        placeholder="Select a option"
        @change="changeDepth"
      />
    </span>
    <span class="switch-icon ml-5" title="Settings">
      <Icon @click="setConfig" size="middle" iconName="settings" />
    </span>
    <div class="settings" v-show="showSettings">
      <Settings @update="updateConfig" />
    </div>
  </div>
  <div
    class="sankey"
    :style="`height:${height}px;width:${width}px;`"
    v-loading="loading"
  >
    <Sankey @click="selectNodeLink" />
  </div>
  <div
    class="operations-list"
    v-if="topologyStore.node"
    :style="{
      top: operationsPos.y + 'px',
      left: operationsPos.x + 'px',
    }"
  >
    <span v-for="(item, index) of items" :key="index" @click="item.func">
      {{ item.title }}
    </span>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref, onMounted, reactive } from "vue";
import { Option } from "@/types/app";
import { useTopologyStore } from "@/store/modules/topology";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useSelectorStore } from "@/store/modules/selectors";
import { EntityType } from "../../../data";
import { ElMessage } from "element-plus";
import Sankey from "./Sankey.vue";
import Settings from "./Settings.vue";
import router from "@/router";

const { t } = useI18n();
const dashboardStore = useDashboardStore();
const selectorStore = useSelectorStore();
const topologyStore = useTopologyStore();
const loading = ref<boolean>(false);
const height = ref<number>(document.body.clientHeight - 150);
const width = ref<number>(document.body.clientWidth - 40);
const showSettings = ref<boolean>(false);
const depth = ref<string>("2");
const showTool = ref<boolean>(false);
const depthList = [1, 2, 3, 4, 5].map((item: number) => ({
  value: String(item),
  label: String(item),
}));
const settings = ref<any>({});
const items = ref([
  { id: "inspect", title: "Inspect", func: inspect },
  { id: "alarm", title: "Alarm", func: goAlarm },
]);
const operationsPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });

onMounted(async () => {
  loading.value = true;
  const resp = await getTopology();
  loading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
  }
});

function inspect() {
  console.log(settings.value);
}

function goAlarm() {
  console.log(settings.value);
}
function goDashboard() {
  console.log(settings.value);
}

function setConfig() {
  showSettings.value = !showSettings.value;
}

function updateConfig(config: any) {
  items.value = [
    { id: "inspect", title: "Inspect", func: inspect },
    { id: "alarm", title: "Alarm", func: goAlarm },
  ];
  settings.value = config;
  if (config.nodeDashboard) {
    items.value.push({
      id: "dashboard",
      title: "Dashboard",
      func: goDashboard,
    });
  }
}

function selectNodeLink(d: any) {
  if (d.dataType === "edge") {
    topologyStore.setNode(null);
    topologyStore.setLink(d.data);
    if (!settings.value.linkDashboard) {
      return;
    }
    console.log(d.data);
    const { sourceObj, targetObj } = d.data;
    const entity =
      dashboardStore.entity === EntityType[2].value
        ? EntityType[6].value
        : EntityType[5].value;
    const path = `/dashboard/${dashboardStore.layerId}/${entity}/${sourceObj.serviceId}/${sourceObj.id}/${targetObj.serviceId}/${targetObj.id}/${settings.value.linkDashboard}`;
    const routeUrl = router.resolve({ path });
    window.open(routeUrl.href, "_blank");
  } else {
    topologyStore.setNode(d.data);
    topologyStore.setLink(null);
    showTool.value = true;
  }
}

async function changeDepth(opt: Option[]) {
  depth.value = opt[0].value;
  loading.value = true;
  const resp = await getTopology();
  loading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
  }
}

async function getTopology() {
  let resp;
  switch (dashboardStore.entity) {
    case EntityType[2].value:
      resp = await topologyStore.updateEndpointTopology(
        [selectorStore.currentPod.id],
        Number(depth.value)
      );
      break;
    case EntityType[4].value:
      resp = await topologyStore.getInstanceTopology();
      break;
  }
  return resp;
}
</script>
<style lang="scss" scoped>
.sankey {
  margin-top: 10px;
}

.settings {
  position: absolute;
  top: 40px;
  right: 0;
  width: 360px;
  height: 700px;
  background-color: #2b3037;
  overflow: auto;
  padding: 0 15px;
  border-radius: 3px;
  color: #ccc;
  transition: all 0.5ms linear;
  z-index: 99;
  text-align: left;
}

.tool {
  text-align: right;
  margin-top: 10px;
  position: relative;
}

.switch-icon {
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.5ms linear;
  background-color: #252a2f99;
  color: #ddd;
  display: inline-block;
  border-radius: 3px;
}

.label {
  color: #ccc;
  display: inline-block;
  margin-right: 5px;
}
</style>
