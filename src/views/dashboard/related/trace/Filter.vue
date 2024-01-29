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
    <div class="mr-10" v-if="dashboardStore.entity === EntityType[1].value">
      <span class="grey mr-5">{{ t("service") }}:</span>
      <Selector
        size="small"
        :value="state.service.value"
        :options="traceStore.services"
        placeholder="Select a service"
        @change="changeField('service', $event)"
      />
    </div>
    <div class="mr-10" v-if="dashboardStore.entity !== EntityType[3].value">
      <span class="grey mr-5">{{ t("instance") }}:</span>
      <Selector
        size="small"
        :value="state.instance.value"
        :options="traceStore.instances"
        placeholder="Select a instance"
        @change="changeField('instance', $event)"
      />
    </div>
    <div class="mr-10" v-if="dashboardStore.entity !== EntityType[2].value">
      <span class="grey mr-5">{{ t("endpoint") }}:</span>
      <Selector
        size="small"
        :value="state.endpoint.value"
        :options="traceStore.endpoints"
        placeholder="Select a endpoint"
        :isRemote="true"
        @change="changeField('endpoint', $event)"
        @query="searchEndpoints"
      />
    </div>
    <div class="mr-10">
      <span class="grey mr-5">{{ t("status") }}:</span>
      <Selector
        size="small"
        :value="state.status.value"
        :options="Status"
        placeholder="Select a status"
        @change="changeField('status', $event)"
      />
    </div>
    <el-button size="small" type="primary" @click="searchTraces" class="search-btn">
      {{ t("search") }}
    </el-button>
  </div>
  <div class="flex-h row">
    <div class="mr-10">
      <span class="grey mr-5">{{ t("traceID") }}:</span>
      <el-input size="small" v-model="traceId" class="traceId" />
    </div>
    <div class="mr-10">
      <span class="sm b grey mr-5">{{ t("duration") }}:</span>
      <el-input size="small" class="inputs mr-5" v-model="minTraceDuration" type="number" />
      <span class="grey mr-5">-</span>
      <el-input size="small" class="inputs" v-model="maxTraceDuration" type="number" />
    </div>
  </div>
  <div class="flex-h">
    <ConditionTags :type="'TRACE'" @update="updateTags" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, watch, onUnmounted } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import type { Option, DurationTime } from "@/types/app";
  import { useTraceStore } from "@/store/modules/trace";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useSelectorStore } from "@/store/modules/selectors";
  import ConditionTags from "@/views/components/ConditionTags.vue";
  import { ElMessage } from "element-plus";
  import { EntityType, QueryOrders, Status } from "../../data";
  import type { LayoutConfig } from "@/types/dashboard";

  /*global defineProps, defineEmits, Recordable */
  const emits = defineEmits(["get"]);
  const props = defineProps({
    needQuery: { type: Boolean, default: true },
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({ graph: {} }),
    },
  });
  const filters = reactive<Recordable>(props.data.filters || {});
  const traceId = ref<string>(filters.traceId || "");
  const { t } = useI18n();
  const appStore = useAppStoreWithOut();
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const traceStore = useTraceStore();
  const duration = ref<DurationTime>(filters.duration || appStore.durationTime);
  const minTraceDuration = ref<number>();
  const maxTraceDuration = ref<number>();
  const tagsList = ref<string[]>([]);
  const tagsMap = ref<Option[]>([]);
  const state = reactive<Recordable>({
    status: filters.status === "ERROR" ? Status[2] : Status[0],
    instance: { value: "0", label: "All" },
    endpoint: { value: "0", label: "All" },
    service: { value: "", label: "" },
  });
  if (filters.queryOrder) {
    traceStore.setTraceCondition({
      queryOrder: filters.queryOrder,
    });
  }
  if (props.needQuery) {
    init();
  }

  async function init() {
    duration.value = filters.duration || appStore.durationTime;
    if (dashboardStore.entity === EntityType[1].value) {
      await getServices();
    }
    if (dashboardStore.entity === EntityType[2].value) {
      await getInstances();
    }
    if (dashboardStore.entity === EntityType[3].value) {
      await getEndpoints();
    }
    if (dashboardStore.entity === EntityType[0].value) {
      await getInstances();
      await getEndpoints();
    }
    await searchTraces();
  }

  async function getServices() {
    const resp = await traceStore.getServices(dashboardStore.layerId);
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    if (props.data.filters && props.data.filters.id === "0") {
      state.service = { value: "", label: "" };
      return;
    } else {
      state.service = getCurrentNode(traceStore.services) || traceStore.services[0];
    }

    emits("get", state.service.id);

    getEndpoints(state.service.id);
    getInstances(state.service.id);
  }

  async function getEndpoints(id?: string, keyword?: string) {
    const resp = await traceStore.getEndpoints(id, keyword);
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.endpoint = getCurrentNode(traceStore.endpoints) || traceStore.endpoints[0];
  }
  async function getInstances(id?: string) {
    const resp = await traceStore.getInstances(id);
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.instance = getCurrentNode(traceStore.instances) || traceStore.instances[0];
  }
  function getCurrentNode(arr: { id: string }[]) {
    let item;
    if (!props.data.filters) {
      return item;
    }
    if (props.data.filters.id) {
      item = arr.find((d: { id: string }) => d.id === props.data.filters?.id);
    }

    return item;
  }
  function setCondition() {
    let param: Recordable = {
      traceState: state.status.value || "ALL",
      tags: tagsMap.value.length ? tagsMap.value : undefined,
      queryOrder: traceStore.conditions.queryOrder || QueryOrders[1].value,
      queryDuration: duration.value,
      minTraceDuration: Number(minTraceDuration.value),
      maxTraceDuration: Number(maxTraceDuration.value),
      traceId: traceId.value || undefined,
      paging: { pageNum: 1, pageSize: 20 },
    };
    if (props.data.filters && props.data.filters.id) {
      param = {
        ...param,
        serviceId: props.data.filters.id && props.data.filters.id !== "0" ? props.data.filters.id : undefined,
        endpointId: state.endpoint.id || undefined,
        serviceInstanceId: state.instance.id || undefined,
      };
      return param;
    }
    let endpoint = "",
      instance = "";
    if (dashboardStore.entity === EntityType[2].value) {
      endpoint = selectorStore.currentPod.id;
    }
    if (dashboardStore.entity === EntityType[3].value) {
      instance = selectorStore.currentPod.id;
    }
    param = {
      ...param,
      serviceId: selectorStore.currentService ? selectorStore.currentService.id : state.service.id,
      endpointId: endpoint || state.endpoint.id || undefined,
      serviceInstanceId: instance || state.instance.id || undefined,
    };
    return param;
  }
  function searchTraces() {
    traceStore.setTraceCondition(setCondition());
    queryTraces();
  }
  async function queryTraces() {
    const res = await traceStore.getTraces();
    if (res && res.errors) {
      ElMessage.error(res.errors);
    }
  }
  function changeField(type: string, opt: Recordable) {
    state[type] = opt[0];
    if (type === "service") {
      getEndpoints(state.service.id);
      getInstances(state.service.id);
      emits("get", state.service.id);
    }
  }
  function updateTags(data: { tagsMap: Array<Option>; tagsList: string[] }) {
    tagsList.value = data.tagsList;
    tagsMap.value = data.tagsMap;
  }
  async function searchEndpoints(keyword: string) {
    const resp = await traceStore.getEndpoints(state.service.id, keyword);
    if (resp.errors) {
      ElMessage.error(resp.errors);
    }
  }
  onUnmounted(() => {
    traceStore.resetState();
    const config = props.data;
    delete config.filters;
    dashboardStore.setWidget(config);
  });
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
    () => [selectorStore.currentService],
    () => {
      if (dashboardStore.entity !== EntityType[0].value) {
        return;
      }
      init();
    },
  );
  watch(
    () => appStore.durationTime,
    () => {
      duration.value = appStore.durationTime;
      if (dashboardStore.entity === EntityType[1].value) {
        init();
      }
    },
  );
  // Event widget associate with trace widget
  watch(
    () => props.data.filters,
    (newJson, oldJson) => {
      if (!props.data.filters) {
        return;
      }
      if (JSON.stringify(newJson) === JSON.stringify(oldJson)) {
        return;
      }
      traceId.value = props.data.filters.traceId || "";
      duration.value = props.data.filters.duration || appStore.durationTime;
      init();
    },
  );
</script>
<style lang="scss" scoped>
  .inputs {
    width: 120px;
  }

  .row {
    margin-bottom: 5px;
    position: relative;
  }

  .traceId {
    width: 270px;
  }

  .search-btn {
    cursor: pointer;
    width: 120px;
    position: absolute;
    top: 0;
    right: 10px;
  }
</style>
