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
    <div class="mr-5">
      <span class="grey mr-5">{{ t("instance") }}:</span>
      <Selector
        size="small"
        v-model="state.instance"
        :options="traceStore.instances"
        placeholder="Select a instance"
        @change="changeField('instance', $event)"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("endpoint") }}:</span>
      <Selector
        size="small"
        v-model="state.endpoint"
        :options="traceStore.endpoints"
        placeholder="Select a endpoint"
        @change="changeField('endpoint', $event)"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("status") }}:</span>
      <Selector
        size="small"
        v-model="state.status"
        :options="Status"
        placeholder="Select a status"
        @change="changeField('status', $event)"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("traceID") }}:</span>
      <el-input v-model="traceId" class="traceId" />
    </div>
    <div class="mr-5">
      <span class="sm b grey mr-5">{{ t("duration") }}:</span>
      <el-input class="inputs mr-5" v-model="minTraceDuration" />
      <span class="grey mr-5">-</span>
      <el-input class="inputs" v-model="maxTraceDuration" />
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
    <ConditionTags :type="'TRACE'" @update="updateTags" />
    <el-button class="search-btn" size="small" type="primary">
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
import ConditionTags from "@/views/components/ConditionTags.vue";
// import type { PropType } from "vue";

const { t } = useI18n();
// const appStore = useAppStoreWithOut();
const traceStore = useTraceStore();
const traceId = ref<string>("");
const minTraceDuration = ref<string>("");
const maxTraceDuration = ref<string>("");
const tagsList = ref<string[]>([]);
const tagsMap = ref<Option[]>([]);
const state = reactive<any>({
  status: "",
  instance: "",
  endpoint: "",
});

// const dateTime = computed(() => [
//   appStore.durationRow.start,
//   appStore.durationRow.end,
// ]);
traceStore.getTraces({
  queryOrder: "DES",
  paging: { pageNum: 1, pageSize: 15, needTotal: true },
});
function changeField(type: string, opt: any[]) {
  state[type] = opt[0].value;
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
