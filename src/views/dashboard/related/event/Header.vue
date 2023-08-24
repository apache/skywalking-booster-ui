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
  <div class="flex-h row">
    <div class="mr-5" v-if="dashboardStore.entity !== EntityType[3].value">
      <span class="grey mr-5"> {{ t("instance") }}: </span>
      <Selector
        size="small"
        :value="state.instance.value"
        :options="eventStore.instances"
        placeholder="Select a instance"
        @change="changeField('instance', $event)"
      />
    </div>
    <div class="mr-5" v-if="dashboardStore.entity !== EntityType[2].value">
      <span class="grey mr-5"> {{ t("endpoint") }}: </span>
      <Selector
        size="small"
        :value="state.endpoint.value"
        :options="eventStore.endpoints"
        placeholder="Select a endpoint"
        @change="changeField('endpoint', $event)"
        :isRemote="true"
        @query="searchEndpoints"
      />
    </div>
    <div class="mr-5">
      <span class="grey">{{ t("eventsType") }}: </span>
      <Selector
        v-model="state.eventType"
        :options="EventTypes"
        placeholder="Select a type"
        @change="changeField('eventType', $event)"
        class="event-tool-input"
        size="small"
      />
    </div>
    <el-pagination
      v-model="pageNum"
      :page-size="pageSize"
      layout="prev, pager, next"
      :total="total"
      @current-change="updatePage"
      :pager-count="5"
      small
    />
    <el-button class="search-btn" size="small" type="primary" @click="queryEvents">
      {{ t("search") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed, reactive, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useEventStore } from "@/store/modules/event";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import { EntityType } from "../../data";
  import { EventTypes } from "./data";

  /*global defineProps */
  const props = defineProps({
    needQuery: { type: Boolean, default: true },
  });
  const { t } = useI18n();
  const appStore = useAppStoreWithOut();
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const eventStore = useEventStore();
  const pageSize = 20;
  const pageNum = ref<number>(1);
  const state = reactive<any>({
    instance: { value: "", label: "All", id: "" },
    endpoint: { value: "", label: "All", id: "" },
    eventType: { value: "", label: "All" },
  });
  const total = computed(() =>
    eventStore.events.length === pageSize ? pageSize * pageNum.value + 1 : pageSize * pageNum.value,
  );
  if (props.needQuery) {
    init();
  }
  async function init() {
    fetchSelectors();
    await queryEvents();
    state.instance = { value: "", label: "All" };
    state.endpoint = { value: "", label: "All" };
  }

  function fetchSelectors() {
    if (dashboardStore.entity === EntityType[2].value) {
      getInstances();
      return;
    }
    if (dashboardStore.entity === EntityType[3].value) {
      getEndpoints();
      return;
    }
    if (dashboardStore.entity === EntityType[0].value) {
      getInstances();
      getEndpoints();
    }
  }

  async function getEndpoints(id?: string) {
    const resp = await eventStore.getEndpoints(id);
    if (!resp) {
      return;
    }
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.endpoint = eventStore.endpoints[0];
  }
  async function getInstances(id?: string) {
    const resp = await eventStore.getInstances(id);
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.instance = eventStore.instances[0];
  }
  async function queryEvents() {
    let endpoint = state.endpoint.value,
      instance = state.instance.value;
    if (dashboardStore.entity === EntityType[2].value) {
      endpoint = selectorStore.currentPod && selectorStore.currentPod.id;
    }
    if (dashboardStore.entity === EntityType[3].value) {
      instance = selectorStore.currentPod && selectorStore.currentPod.id;
    }
    if (!selectorStore.currentService) {
      return;
    }
    eventStore.setEventCondition({
      // layer: dashboardStore.layerId,
      paging: {
        pageNum: pageNum.value,
        pageSize: pageSize,
      },
      source: {
        service: selectorStore.currentService.value || "",
        endpoint: endpoint || "",
        serviceInstance: instance || "",
      },
      type: state.eventType.value || undefined,
    });
    const res = await eventStore.getEvents();
    if (res && res.errors) {
      ElMessage.error(res.errors);
    }
  }
  function changeField(type: string, opt: any[]) {
    state[type] = opt[0];
  }
  async function searchEndpoints(keyword: string) {
    const resp = await eventStore.getEndpoints(keyword);
    if (resp.errors) {
      ElMessage.error(resp.errors);
    }
  }

  function updatePage(p: number) {
    pageNum.value = p;
    queryEvents();
  }

  watch(
    () => [selectorStore.currentService],
    () => {
      if (dashboardStore.entity === EntityType[0].value) {
        init();
      }
    },
  );

  watch(
    () => [selectorStore.currentPod],
    () => {
      if (dashboardStore.entity === EntityType[0].value) {
        return;
      }
      init();
    },
  );
  watch(
    () => appStore.durationTime,
    () => {
      if (dashboardStore.entity === EntityType[1].value) {
        init();
      }
    },
  );
</script>
<style lang="scss" scoped>
  .inputs {
    width: 120px;
  }

  .inputs-max {
    width: 270px;
  }

  .search-btn {
    cursor: pointer;
    width: 120px;
  }

  .selected {
    display: inline-block;
    padding: 0 3px;
    border-radius: 3px;
    overflow: hidden;
    color: $font-color;
    border: 1px dashed #aaa;
    font-size: $font-size-smaller;
    margin: 0 2px;
  }
</style>
