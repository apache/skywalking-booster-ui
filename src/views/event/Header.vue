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
          v-model="state.service"
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
          v-model="state.instance"
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
          v-model="state.endpoint"
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
    <div class="mt-5">
      <el-pagination
        v-model:currentPage="pageNum"
        v-model:page-size="pageSize"
        layout="prev, pager, next"
        :total="total"
        @current-change="updatePage"
        :pager-count="5"
        small
        :style="`--el-pagination-bg-color: #f0f2f5; --el-pagination-button-disabled-bg-color: #f0f2f5;`"
      />
      <!-- <div>
        <el-button class="search" type="primary" @click="queryEvents">
          <Icon iconName="search" class="mr-5" />
          <span class="vm">{{ t("search") }}</span>
        </el-button>
      </div> -->
    </div>
  </nav>
</template>
<script lang="ts" setup>
import { ref, reactive, computed } from "vue";
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
  service: string;
  instance: string;
  endpoint: string;
}>({
  currentLayer: "",
  layers: [],
  eventType: "",
  service: "",
  instance: "",
  endpoint: "",
});
const total = computed(() =>
  eventStore.events.length === pageSize
    ? pageSize * pageNum.value + 1
    : pageSize * pageNum.value
);

getSelectors();

async function getSelectors() {
  await getLayers();
  getServices();
}

async function getServices() {
  const resp = await eventStore.getServices(state.currentLayer);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.service = eventStore.services[0].value;
  if (!eventStore.services[0].id) {
    queryEvents();
    return;
  }
  getEndpoints(eventStore.services[0].id);
  getInstances(eventStore.services[0].id);
  queryEvents();
}

async function getEndpoints(id: string) {
  const resp = await eventStore.getEndpoints(id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.endpoint = eventStore.endpoints[0].value;
}
async function getInstances(id: string) {
  const resp = await eventStore.getInstances(id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = eventStore.instances[0].value;
}

async function getLayers() {
  const resp = await selectorStore.fetchLayers();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.currentLayer = "";
  state.layers = [
    { label: "All", value: "" },
    ...resp.data.layers.map((d: string) => {
      return { label: d, value: d };
    }),
  ];
}

async function queryEvents() {
  eventStore.setEventCondition({
    paging: {
      pageNum: pageNum.value,
      pageSize: pageSize,
    },
    source: {
      service: state.service || "",
      endpoint: state.endpoint || "",
      serviceInstance: state.instance || "",
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
}

function selectService(opt: any) {
  state.service = opt[0].value;
  queryEvents();
  if (!opt[0].id) {
    return;
  }
  getEndpoints(opt[0].id);
  getInstances(opt[0].id);
}

function selectInstance(opt: any) {
  state.instance = opt[0].value;
  queryEvents();
}

function selectEndpoint(opt: any) {
  state.endpoint = opt[0].value;
  queryEvents();
}

function selectType(opt: any) {
  state.eventType = opt[0].value;
  queryEvents();
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
