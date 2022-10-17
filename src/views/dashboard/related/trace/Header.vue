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
  <div class="flex-h">
    <ConditionTags :type="'TRACE'" @update="updateTags" />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onUnmounted } from "vue";
import type { PropType } from "vue";
import { Option, DurationTime } from "@/types/app";
import { useTraceStore } from "@/store/modules/trace";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import ConditionTags from "@/views/components/ConditionTags.vue";
import { ElMessage } from "element-plus";
import { EntityType, QueryOrders, Status } from "../../data";
import { LayoutConfig } from "@/types/dashboard";

/*global defineProps, Recordable */
const props = defineProps({
  needQuery: { type: Boolean, default: true },
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ graph: {} }),
  },
});
const filters = reactive<Recordable>(props.data.filters || {});
const traceId = ref<string>(filters.traceId || "");
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
  status: filters.status === "ERROR" ? Status[2].value : Status[0].value,
  instance: "",
  endpoint: "",
  service: "",
});

init();
async function init() {
  if (dashboardStore.entity === EntityType[1].value) {
    await getService();
  }
  if (dashboardStore.entity === EntityType[0].value) {
    state.service = selectorStore.currentService.id;
    await getInstance();
    await getEndpoint();
  }
  await queryTraces();
}
async function getService() {
  const resp = await traceStore.getService(filters.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.service = resp.data.service;
}
async function getEndpoint() {
  const resp = await traceStore.getEndpoint(filters.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.endpoint = resp.data.endpoint.id;
}
async function getInstance() {
  const resp = await traceStore.getInstance(filters.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = resp.data.instance.id;
}
function setCondition() {
  if (filters.queryOrder) {
    traceStore.setTraceCondition({
      queryOrder: filters.queryOrder,
    });
  }
  let param: any = {
    traceState: state.status || Status[0].value,
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
      serviceId: state.service || undefined,
      endpointId: state.endpoint || undefined,
      serviceInstanceId: state.instance || undefined,
    };
  }
  return param;
}
async function queryTraces() {
  traceStore.setTraceCondition(setCondition());
  const res = await traceStore.getTraces();
  if (res && res.errors) {
    ElMessage.error(res.errors);
  }
}
function updateTags(data: { tagsMap: Array<Option>; tagsList: string[] }) {
  tagsList.value = data.tagsList;
  tagsMap.value = data.tagsMap;
}
onUnmounted(() => {
  traceStore.resetState();
});
</script>
<style lang="scss" scoped>
.row {
  margin-bottom: 5px;
  position: relative;
}

.search-btn {
  cursor: pointer;
  width: 120px;
  position: absolute;
  top: 0;
  right: 10px;
}
</style>
