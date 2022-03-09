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
  <nav class="event-tool flex-v">
    <div class="flex-h">
      <div class="mr-5">
        <span class="grey">{{ t("layer") }}: </span>
        <Selector
          v-model="state.currentLayer"
          :options="state.layers"
          placeholder="Select a layer"
          @change="selectLayer"
          class="event-tool-input"
          size="small"
        />
      </div>
      <div class="mr-5">
        <span class="grey">{{ t("service") }}: </span>
        <Selector
          v-model="state.service.value"
          :options="eventStore.services"
          placeholder="Select a service"
          @change="selectService"
          class="event-tool-input"
          size="small"
        />
      </div>
      <div class="mr-5">
        <span class="grey mr-5">{{ t("instance") }}: </span>
        <Selector
          v-model="state.instance.value"
          :options="eventStore.instances"
          placeholder="Select a instance"
          @change="selectInstance"
          class="event-tool-input"
          size="small"
        />
      </div>
      <div class="mr-5">
        <span class="grey mr-5">{{ t("endpoint") }}: </span>
        <Selector
          v-model="state.endpoint.value"
          :options="eventStore.endpoints"
          placeholder="Select a endpoint"
          @change="selectEndpoint"
          class="event-tool-input"
          size="small"
        />
      </div>
      <div class="mr-5">
        <span class="grey">{{ t("eventsType") }}: </span>
        <Selector
          v-model="state.eventType"
          :options="EventTypes"
          placeholder="Select a type"
          @change="selectType"
          class="event-tool-input"
          size="small"
        />
      </div>
    </div>
    <div class="flex-h mt-5">
      <el-pagination
        v-model:currentPage="pageNum"
        v-model:page-size="pageSize"
        layout="prev, jumper, total, next"
        :total="eventStore.total"
        @current-change="updatePage"
        :pager-count="5"
        small
        :style="`--el-pagination-bg-color: #f0f2f5; --el-pagination-button-disabled-bg-color: #f0f2f5;`"
      />
      <div>
        <el-button class="search" type="primary" @click="queryEvents">
          <Icon iconName="search" class="mr-5" />
          <span class="vm">{{ t("search") }}</span>
        </el-button>
      </div>
    </div>
  </nav>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { EventTypes } from "./data";
import { useEventStore } from "@/store/modules/event";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";

const { t } = useI18n();
const eventStore = useEventStore();
const selectorStore = useSelectorStore();
const pageSize = 20;
const pageNum = ref<number>(1);
const state = reactive<{
  currentLayer: string;
  layers: string[];
  eventType: string;
  service: { id: string; value: string; label: string };
  instance: { id: string; value: string; label: string };
  endpoint: { id: string; value: string; label: string };
}>({
  currentLayer: "",
  layers: [],
  eventType: "",
  service: { id: "", value: "", label: "" },
  instance: { id: "", value: "", label: "" },
  endpoint: { id: "", value: "", label: "" },
});

getSelectors();

async function getSelectors() {
  await getLayers();
  if (!state.currentLayer) {
    return;
  }
  await getServices();
  if (!state.service.id) {
    queryEvents();
    return;
  }
  getEndpoints();
  getInstances();
  queryEvents();
}

async function getServices() {
  const resp = await eventStore.getServices(state.currentLayer);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.service = eventStore.services[0];
}

async function getEndpoints() {
  const resp = await eventStore.getEndpoints(state.service.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.endpoint = eventStore.endpoints[0];
}
async function getInstances() {
  const resp = await eventStore.getInstances(state.service.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = eventStore.instances[0];
}

async function getLayers() {
  const resp = await selectorStore.fetchLayers();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.currentLayer = resp.data.layers[0] || "";
  state.layers = resp.data.layers.map((d: string) => {
    return { label: d, value: d };
  });
}

async function queryEvents() {
  eventStore.setEventCondition({
    paging: {
      pageNum: pageNum.value,
      pageSize: pageSize,
      needTotal: true,
    },
    source: {
      service: state.service.value || "",
      endpoint: state.endpoint.value || "",
      serviceInstance: state.instance.value || "",
    },
    type: state.eventType || undefined,
  });
  const resp = await eventStore.getEvents();
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
}

async function selectLayer(opt: any) {
  state.currentLayer = opt[0].value;
  await getServices();
  if (!state.service.id) {
    return;
  }
  getEndpoints();
  getInstances();
}

function selectService(opt: any) {
  state.service = opt[0];
  if (!state.service.id) {
    return;
  }
  getEndpoints();
  getInstances();
}

function selectInstance(opt: any) {
  state.instance = opt[0];
}

function selectEndpoint(opt: any) {
  state.endpoint = opt[0];
}

function selectType(opt: any) {
  state.eventType = opt[0].value;
}

function updatePage(p: number) {
  pageNum.value = p;
  queryEvents();
}
</script>
<style lang="scss" scoped>
.event-tool {
  background-color: #f0f2f5;
  width: 100%;
  padding: 10px;
}

.event-tool-input {
  width: 200px;
}

.search {
  margin-left: 20px;
}
</style>
