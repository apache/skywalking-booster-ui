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
    <div class="mr-5" v-if="dashboardStore.entity === EntityType[1].value">
      <span class="grey mr-5">{{ t("service") }}:</span>
      <Selector
        size="small"
        :value="state.service.value"
        :options="logStore.services"
        placeholder="Select a service"
        @change="changeField('service', $event)"
      />
    </div>
    <div class="mr-5" v-if="dashboardStore.entity !== EntityType[3].value">
      <span class="grey mr-5">{{ t("instance") }}:</span>
      <Selector
        size="small"
        :value="state.instance.value"
        :options="logStore.instances"
        placeholder="Select a instance"
        @change="changeField('instance', $event)"
      />
    </div>
    <div class="mr-5" v-if="dashboardStore.entity !== EntityType[2].value">
      <span class="grey mr-5">{{ t("endpoint") }}:</span>
      <Selector
        size="small"
        :value="state.endpoint.value"
        :options="logStore.endpoints"
        placeholder="Select a endpoint"
        @change="changeField('endpoint', $event)"
      />
    </div>
  </div>
  <div class="row tips">
    <b>{{ t("conditionNotice") }}</b>
  </div>
  <div class="flex-h row">
    <div class="mr-5 traceId">
      <span class="grey mr-5">{{ t("traceID") }}:</span>
      <el-input v-model="traceId" class="inputs-max" />
    </div>
    <ConditionTags :type="'LOG'" @update="updateTags" />
  </div>
  <div class="flex-h">
    <div class="mr-5" v-show="logStore.supportQueryLogsByKeywords">
      <span class="mr-5 grey">{{ t("keywordsOfContent") }}:</span>
      <span class="log-tags">
        <span
          class="selected"
          v-for="(item, index) in keywordsOfContent"
          :key="`keywordsOfContent${index}`"
        >
          <span>{{ item }}</span>
          <span class="remove-icon" @click="removeContent(index)">×</span>
        </span>
      </span>
      <el-input
        class="inputs-max"
        :placeholder="t('addKeywordsOfContent')"
        v-model="contentStr"
        @change="addLabels('keywordsOfContent')"
      />
    </div>
    <div class="mr-5" v-show="logStore.supportQueryLogsByKeywords">
      <span class="grey mr-5"> {{ t("excludingKeywordsOfContent") }}: </span>
      <span class="log-tags">
        <span
          class="selected"
          v-for="(item, index) in excludingKeywordsOfContent"
          :key="`excludingKeywordsOfContent${index}`"
        >
          <span>{{ item }}</span>
          <span class="remove-icon" @click="removeExcludeContent(index)">
            ×
          </span>
        </span>
      </span>
      <el-input
        class="inputs-max"
        :placeholder="t('addExcludingKeywordsOfContent')"
        v-model="excludingContentStr"
        @keyup="addLabels('excludingKeywordsOfContent')"
      />
      <el-tooltip :content="t('keywordsOfContentLogTips')">
        <span class="log-tips" v-show="!logStore.supportQueryLogsByKeywords">
          <Icon icon="help" class="mr-5" />
        </span>
      </el-tooltip>
    </div>
    <el-button
      class="search-btn"
      size="small"
      type="primary"
      @click="searchLogs"
    >
      {{ t("search") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Option } from "@/types/app";
import { useLogStore } from "@/store/modules/log";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import ConditionTags from "@/views/dashboard/related/components/ConditionTags.vue";
import { ElMessage } from "element-plus";
import { EntityType } from "../../data";

const { t } = useI18n();
const appStore = useAppStoreWithOut();
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const logStore = useLogStore();
const traceId = ref<string>("");
const keywordsOfContent = ref<string[]>([]);
const excludingKeywordsOfContent = ref<string[]>([]);
const tagsList = ref<string[]>([]);
const tagsMap = ref<Option[]>([]);
const contentStr = ref<string>("");
const excludingContentStr = ref<string>("");
const state = reactive<any>({
  status: { label: "All", value: "ALL" },
  instance: { value: "0", label: "All" },
  endpoint: { value: "0", label: "All" },
  service: { value: "0", label: "All" },
});

init();
async function init() {
  const resp = await logStore.queryLogsByKeywords();

  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  searchLogs();
  if (dashboardStore.entity === EntityType[1].value) {
    getServices();
    return;
  }
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

async function getServices() {
  const resp = await logStore.getServices(dashboardStore.layerId);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.service = logStore.services[0];
}

async function getEndpoints() {
  const resp = await logStore.getEndpoints();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.endpoint = logStore.endpoints[0];
}
async function getInstances() {
  const resp = await logStore.getInstances();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = logStore.instances[0];
}
function searchLogs() {
  let endpoint = "",
    instance = "";
  if (dashboardStore.entity === EntityType[2].value) {
    endpoint = selectorStore.currentPod.id;
  }
  if (dashboardStore.entity === EntityType[3].value) {
    instance = selectorStore.currentPod.id;
  }
  logStore.setLogCondition({
    serviceId: selectorStore.currentService
      ? selectorStore.currentService.id
      : state.service.id,
    endpointId: endpoint || state.endpoint.id || undefined,
    serviceInstanceId: instance || state.instance.id || undefined,
    queryDuration: appStore.durationTime,
    keywordsOfContent: keywordsOfContent.value,
    excludingKeywordsOfContent: excludingKeywordsOfContent.value,
    tags: tagsMap.value.length ? tagsMap.value : undefined,
    paging: { pageNum: 1, pageSize: 15, needTotal: true },
    relatedTrace: traceId.value ? { traceId: traceId.value } : undefined,
  });
  queryLogs();
}
async function queryLogs() {
  if (dashboardStore.layerId === "Browser") {
    const res = await logStore.getBrowserLogs();
    if (res && res.errors) {
      ElMessage.error(res.errors);
    }
    return;
  }
  const res = await logStore.getLogs();
  if (res && res.errors) {
    ElMessage.error(res.errors);
  }
}
function changeField(type: string, opt: any) {
  state[type] = opt[0];
  if (type === "service") {
    getEndpoints();
    getInstances();
  }
}
function updateTags(data: { tagsMap: Array<Option>; tagsList: string[] }) {
  tagsList.value = data.tagsList;
  tagsMap.value = data.tagsMap;
}
function removeContent(index: number) {
  const keywordsOfContentList = keywordsOfContent.value || [];
  keywordsOfContentList.splice(index, 1);
  logStore.setLogCondition({
    keywordsOfContent: keywordsOfContentList,
  });
  contentStr.value = "";
}
function addLabels(type: string) {
  if (type === "keywordsOfContent" && !contentStr.value) {
    return;
  }
  if (type === "excludingKeywordsOfContent" && !excludingContentStr.value) {
    return;
  }
  if (type === "keywordsOfContent") {
    keywordsOfContent.value.push(contentStr.value);
    logStore.setLogCondition({
      [type]: keywordsOfContent.value,
    });
    contentStr.value = "";
  } else if (type === "excludingKeywordsOfContent") {
    excludingKeywordsOfContent.value.push(excludingContentStr.value);
    logStore.setLogCondition({
      [type]: excludingKeywordsOfContent.value,
    });
    excludingContentStr.value = "";
  }
}
function removeExcludeContent(index: number) {
  excludingKeywordsOfContent.value.splice(index, 1);
  logStore.setLogCondition({
    excludingKeywordsOfContent: excludingKeywordsOfContent.value,
  });
  excludingContentStr.value = "";
}
watch(
  () => selectorStore.currentService,
  () => {
    if (dashboardStore.entity !== EntityType[0].value) {
      return;
    }
    init();
  }
);
</script>
<style lang="scss" scoped>
.inputs {
  width: 120px;
}

.row {
  margin-bottom: 5px;
}

.inputs-max {
  width: 270px;
}

.traceId {
  margin-top: 2px;
}

.search-btn {
  margin-left: 20px;
  cursor: pointer;
}

.tips {
  color: #888;
}

.log-tag {
  width: 30%;
  border-style: unset;
  outline: 0;
  border: 1px solid #ccc;
  height: 30px;
  padding: 0 5px;
}

.log-tags {
  padding: 1px 5px 0 0;
  border-radius: 3px;
  height: 24px;
  display: inline-block;
  vertical-align: top;
}

.selected {
  display: inline-block;
  padding: 0 3px;
  border-radius: 3px;
  overflow: hidden;
  color: #3d444f;
  border: 1px dashed #aaa;
  font-size: 12px;
  margin: 0 2px;
}

.remove-icon {
  display: inline-block;
  margin-left: 3px;
  cursor: pointer;
}
</style>
