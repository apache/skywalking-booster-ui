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
    <div class="mr-5 mb-5" v-if="dashboardStore.entity !== EntityType[3].value">
      <span class="grey mr-5"> {{ t("instance") }}: </span>
      <Selector
        size="small"
        :value="state.instance.value"
        :options="demandLogStore.instances"
        placeholder="Select a instance"
        @change="changeField('instance', $event)"
        class="selectors"
      />
    </div>
    <div class="mr-5 mb-5">
      <span class="grey mr-5">{{ t("namespace") }}:</span>
      <Selector
        size="small"
        :value="state.namespace.value"
        :options="demandLogStore.namespaces"
        placeholder="Select a namespace"
        @change="changeField('namespace', $event)"
        class="selectors"
      />
    </div>
    <div class="mr-5 mb-5">
      <span class="grey mr-5">{{ t("container") }}:</span>
      <Selector
        size="small"
        :value="state.container.value"
        :options="demandLogStore.containers"
        placeholder="Select a container"
        @change="changeField('container', $event)"
        class="selectors"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("limit") }}:</span>
      <el-input-number
        v-model="limit"
        :min="1"
        :max="100"
        size="small"
        controls-position="right"
        @change="changeField('limit', $event)"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("duration") }}:</span>
      <Selector
        size="small"
        :value="state.duration.value"
        :options="TimeRanges"
        placeholder="Select a time range"
        @change="changeField('duration', $event)"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("interval") }}:</span>
      <el-input-number
        v-model="intervalTime"
        :min="1"
        :max="120"
        size="small"
        controls-position="right"
        @change="changeField('interval', $event)"
      />
      Seconds
    </div>
  </div>
  <div class="flex-h row">
    <div class="mr-5">
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
        size="small"
        class="inputs-max"
        :placeholder="t('addKeywordsOfContent')"
        v-model="contentStr"
        @change="addLabels('keywordsOfContent')"
      />
    </div>
    <div class="mr-5">
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
        size="small"
        :placeholder="t('addExcludingKeywordsOfContent')"
        v-model="excludingContentStr"
        @change="addLabels('excludingKeywordsOfContent')"
      />
      <el-tooltip :content="t('keywordsOfContentLogTips')">
        <span class="log-tips">
          <Icon icon="help" class="mr-5" />
        </span>
      </el-tooltip>
    </div>
  </div>
  <div class="flex-h row btn-row">
    <el-button
      class="search-btn mt-10"
      size="small"
      type="primary"
      @click="searchLogs"
    >
      <Icon size="sm" iconName="retry" class="reload" />
      {{ t("search") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useDemandLogStore } from "@/store/modules/demand-log";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import { EntityType } from "../../data";
import { TimeRanges } from "./data";
import getLocalTime from "@/utils/localtime";
import dateFormatStep from "@/utils/dateFormat";

const { t } = useI18n();
const appStore = useAppStoreWithOut();
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const demandLogStore = useDemandLogStore();
const keywordsOfContent = ref<string[]>([]);
const excludingKeywordsOfContent = ref<string[]>([]);
const contentStr = ref<string>("");
const excludingContentStr = ref<string>("");
const limit = ref<number>(1);
const intervalTime = ref<number>(1);
const state = reactive<any>({
  instance: { value: "", label: "" },
  container: { value: "", label: "None" },
  namespace: { value: "", label: "None" },
  duration: { label: "Last 30 min", value: 1800 },
});
const rangeTime = computed(() => {
  const times = {
    start: getLocalTime(
      appStore.utc,
      new Date(new Date().getTime() - state.duration.value * 1000)
    ),
    end: getLocalTime(appStore.utc, new Date()),
    step: "SECOND",
  };
  return {
    start: dateFormatStep(times.start, times.step, false),
    end: dateFormatStep(times.end, times.step, false),
    step: times.step,
  };
});

init();
async function init() {
  fetchSelectors();
  await searchLogs();
}
async function fetchSelectors() {
  if (dashboardStore.entity === EntityType[3].value) {
    state.instance = this.selectorStore.currentInstance || {};
  } else {
    await getInstances();
  }
  await getNamespaces();
  getContainers();
}
async function getNamespaces() {
  const resp = await demandLogStore.getNamespaces();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.namespace = demandLogStore.namespaces[0];
}
async function getContainers() {
  const resp = await demandLogStore.getContainers(
    state.namespace,
    state.instance.id || ""
  );
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.container = demandLogStore.containers[0];
}
async function getInstances() {
  const resp = await demandLogStore.getInstances();
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = demandLogStore.instances[0];
}
function searchLogs() {
  let instance = "";
  if (dashboardStore.entity === EntityType[3].value) {
    instance = selectorStore.currentPod.id;
  }
  demandLogStore.setLogCondition({
    serviceId:
      (selectorStore.currentService && selectorStore.currentService.id) || "",
    serviceInstanceId: instance || state.instance.id || "",
    namespace: state.namespace.value,
    container: state.container.value,
    queryDuration: rangeTime.value,
    keywordsOfContent: keywordsOfContent.value,
    excludingKeywordsOfContent: excludingKeywordsOfContent.value,
  });
  queryLogs();
}
async function queryLogs() {
  const res = await demandLogStore.getDemandLogs();
  if (res && res.errors) {
    ElMessage.error(res.errors);
  }
}
function changeField(type: string, opt: any) {
  if (["limit", "interval"].includes(type)) {
    state[type] = opt;
    return;
  }
  state[type] = opt[0];
}
function removeContent(index: number) {
  const keywordsOfContentList = keywordsOfContent.value || [];
  keywordsOfContentList.splice(index, 1);
  demandLogStore.setLogCondition({
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
    demandLogStore.setLogCondition({
      [type]: keywordsOfContent.value,
    });
    contentStr.value = "";
  } else if (type === "excludingKeywordsOfContent") {
    excludingKeywordsOfContent.value.push(excludingContentStr.value);
    demandLogStore.setLogCondition({
      [type]: excludingKeywordsOfContent.value,
    });
    excludingContentStr.value = "";
  }
}
function removeExcludeContent(index: number) {
  excludingKeywordsOfContent.value.splice(index, 1);
  demandLogStore.setLogCondition({
    excludingKeywordsOfContent: excludingKeywordsOfContent.value,
  });
  excludingContentStr.value = "";
}
watch(
  () => selectorStore.currentService,
  () => {
    if (dashboardStore.entity === EntityType[0].value) {
      init();
    }
  }
);
watch(
  () => [selectorStore.currentPod],
  () => {
    if (dashboardStore.entity === EntityType[3].value) {
      init();
    }
  }
);
</script>
<style lang="scss" scoped>
.inputs {
  width: 120px;
}

.row {
  margin-bottom: 5px;
  position: relative;
  flex-wrap: wrap;
}

.inputs-max {
  width: 270px;
}

.traceId {
  margin-top: 2px;
}

.search-btn {
  cursor: pointer;
  width: 220px;
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

.selectors {
  width: 250px;
}

.btn-row {
  justify-content: flex-end;
}
</style>
