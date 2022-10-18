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
  <div class="conditions" v-if="!filters.id">
    <el-radio-group v-model="conditions" @change="changeCondition">
      <el-radio-button
        v-for="(item, index) in items"
        :label="item.key"
        :key="item.key + index"
        border
      >
        {{ item.key }}
      </el-radio-button>
    </el-radio-group>
  </div>
  <div class="flex-h">
    <ConditionTags :type="'TRACE'" @update="updateTags" />
  </div>
  <div class="mr-10">
    <el-button
      size="small"
      type="primary"
      @click="queryTraces"
      class="search-btn"
    >
      {{ t("search") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, onUnmounted } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { Option } from "@/types/app";
import { useTraceStore } from "@/store/modules/trace";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import ConditionTags from "@/views/components/ConditionTags.vue";
import { ElMessage } from "element-plus";
import { EntityType, QueryOrders, Status } from "../../data";
import { LayoutConfig } from "@/types/dashboard";

const filtersKeys: { [key: string]: string } = {
  status: "traceState",
  queryOrder: "queryOrder",
  duration: "queryDuration",
  minTraceDuration: "minTraceDuration",
  maxTraceDuration: "maxTraceDuration",
};
/*global defineProps, Recordable */
const props = defineProps({
  needQuery: { type: Boolean, default: true },
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ graph: {} }),
  },
});
const { t } = useI18n();
const filters = reactive<Recordable>(props.data.filters || {});
const appStore = useAppStoreWithOut();
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const traceStore = useTraceStore();
const tagsList = ref<string[]>([]);
const tagsMap = ref<Option[]>([]);
const state = reactive<Recordable>({
  instance: "",
  endpoint: "",
  service: "",
});
const items = Object.keys(filters).map((d: string) => {
  return { key: d, value: filtersKeys[d] };
});
const conditions = ref(items[0].key);

init();

async function init() {
  if (!filters.id) {
    state.service = selectorStore.currentService.id;
    if (dashboardStore.entity === EntityType[2].value) {
      state.instance = selectorStore.currentPod.id;
    }
    if (dashboardStore.entity === EntityType[3].value) {
      state.endpoint = selectorStore.currentPod.id;
    }
    await queryTraces();
    return;
  }
  if (dashboardStore.entity === EntityType[1].value) {
    await getService();
  }
  if (dashboardStore.entity === EntityType[0].value) {
    state.service = selectorStore.currentService.id;
    await getInstance();
    if (!state.instance) {
      await getEndpoint();
    }
  }
  await queryTraces();
}
async function changeCondition() {
  queryTraces();
}
async function getService() {
  const resp = await traceStore.getService(filters.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.service = (resp.data.service && resp.data.service) || "";
}
async function getEndpoint() {
  const resp = await traceStore.getEndpoint(filters.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.endpoint = (resp.data.endpoint && resp.data.endpoint.id) || "";
}
async function getInstance() {
  const resp = await traceStore.getInstance(filters.id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = (resp.data.instance && resp.data.instance.id) || "";
}
function setCondition() {
  let params: any = {
    traceState: Status[0].value,
    queryOrder: QueryOrders[0].value,
    queryDuration: appStore.durationTime,
    minTraceDuration: undefined,
    maxTraceDuration: undefined,
    tags: tagsMap.value.length ? tagsMap.value : undefined,
    paging: { pageNum: 1, pageSize: 20 },
    serviceId: state.service || undefined,
    endpointId: state.endpoint || undefined,
    serviceInstanceId: state.instance || undefined,
  };
  // echarts
  if (!filters.id) {
    for (const k of items) {
      if (k.key === conditions.value) {
        params[k.value] = filters[k.key];
      }
    }
  }
  return params;
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

.conditions {
  margin-bottom: 10px;
}
</style>
