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
    <div class="mr-5" v-if="dashboardStore.entity === EntityType[0].value">
      <span class="grey mr-5">{{ t("instance") }}:</span>
      <Selector
        size="small"
        :value="state.instance.value"
        :options="traceStore.instances"
        placeholder="Select a instance"
        @change="changeField('instance', $event)"
      />
    </div>
    <div class="mr-5" v-if="dashboardStore.entity === EntityType[0].value">
      <span class="grey mr-5">{{ t("endpoint") }}:</span>
      <Selector
        size="small"
        :value="state.endpoint.value"
        :options="traceStore.endpoints"
        placeholder="Select a endpoint"
        @change="changeField('endpoint', $event)"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("status") }}:</span>
      <Selector
        size="small"
        :value="state.status.value"
        :options="Status"
        placeholder="Select a status"
        @change="changeField('status', $event)"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("traceID") }}:</span>
      <el-input v-model="traceId" class="traceId" />
    </div>
  </div>
  <div class="flex-h">
    <!-- <div class="mr-5">
      <span class="grey mr-5">{{ t("timeRange") }}:</span>
      <TimePicker
        :value="dateTime"
        position="bottom"
        format="YYYY-MM-DD HH:mm"
        @input="changeTimeRange"
      />
    </div> -->
    <div class="mr-5">
      <span class="sm b grey mr-5">{{ t("duration") }}:</span>
      <el-input class="inputs mr-5" v-model="minTraceDuration" />
      <span class="grey mr-5">-</span>
      <el-input class="inputs" v-model="maxTraceDuration" />
    </div>
    <ConditionTags :type="'TRACE'" @update="updateTags" />
    <el-button
      class="search-btn"
      size="small"
      type="primary"
      @click="searchTraces"
    >
      {{ t("search") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { Option } from "@/types/app";
import { Status } from "../../data";
import { useTraceStore } from "@/store/modules/trace";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import ConditionTags from "@/views/components/ConditionTags.vue";
import { ElMessage } from "element-plus";
import { EntityType } from "../../data";

const { t } = useI18n();
const appStore = useAppStoreWithOut();
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const traceStore = useTraceStore();
const traceId = ref<string>("");
const minTraceDuration = ref<string>("");
const maxTraceDuration = ref<string>("");
const tagsList = ref<string[]>([]);
const tagsMap = ref<Option[]>([]);
const state = reactive<any>({
  status: { label: "All", value: "ALL" },
  instance: { label: "", value: "" },
  endpoint: { label: "", value: "" },
});

// const dateTime = computed(() => [
//   appStore.durationRow.start,
//   appStore.durationRow.end,
// ]);
getInstances();
getEndpoints();
searchTraces();

async function getEndpoints() {
  const resp = await traceStore.getEndpoints();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.endpoint = traceStore.endpoints[0];
}
async function getInstances() {
  const resp = await traceStore.getInstances();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = traceStore.instances[0];
}
function searchTraces() {
  traceStore.setTraceCondition({
    serviceId: selectorStore.currentService.id || 0,
    traceId: traceId.value || undefined,
    endpointId: state.endpoint.id || undefined,
    serviceInstanceId: state.instance.id || undefined,
    traceState: state.status.value || "ALL",
    queryDuration: appStore.durationTime,
    minTraceDuration: appStore.minTraceDuration || undefined,
    maxTraceDuration: appStore.maxTraceDuration || undefined,
    queryOrder: "BY_DURATION",
    tags: tagsMap.value.length ? tagsMap.value : undefined,
    paging: { pageNum: 1, pageSize: 15, needTotal: true },
  });
  queryTraces();
}
async function queryTraces() {
  const res = await traceStore.getTraces();
  if (res && res.errors) {
    ElMessage.error(res.errors);
  }
}
function changeField(type: string, opt: any[]) {
  state[type] = opt[0];
}
function updateTags(data: { tagsMap: Array<Option>; tagsList: string[] }) {
  tagsList.value = data.tagsList;
  tagsMap.value = data.tagsMap;
}
</script>
<style lang="scss" scoped>
.inputs {
  width: 120px;
}

.row {
  margin-bottom: 5px;
}

.traceId {
  width: 270px;
}

.search-btn {
  margin-left: 50px;
  cursor: pointer;
}
</style>
