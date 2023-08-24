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
    <div class="mr-5 mb-5" v-if="state.container">
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
    <!-- <div class="mr-5">
      <span class="grey mr-5">{{ t("limit") }}:</span>
      <el-input-number
        v-model="limit"
        :min="1"
        :max="1000"
        size="small"
        controls-position="right"
        @change="changeField('limit', $event)"
      />
    </div> -->
    <div class="mr-5">
      <span class="grey mr-5">{{ t("duration") }}:</span>
      <Selector
        size="small"
        :value="state.duration.value"
        :options="TimeRanges"
        placeholder="Select a time range"
        @change="changeField('duration', $event)"
        class="duration-range"
      />
    </div>
    <div class="mr-5">
      <span class="grey mr-5">{{ t("interval") }}:</span>
      <Selector
        size="small"
        :value="state.interval.value"
        :options="IntervalOpts"
        @change="changeField('interval', $event)"
      />
    </div>
  </div>
  <div class="flex-h row">
    <div class="mr-5">
      <span class="mr-5 grey">{{ t("keywordsOfContent") }}:</span>
      <span class="log-tags">
        <span class="selected" v-for="(item, index) in keywordsOfContent" :key="`keywordsOfContent${index}`">
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
          <span class="remove-icon" @click="removeExcludeContent(index)"> × </span>
        </span>
      </span>
      <el-input
        class="inputs-max"
        size="small"
        :placeholder="t('addExcludingKeywordsOfContent')"
        v-model="excludingContentStr"
        @change="addLabels('excludingKeywordsOfContent')"
      />
    </div>
  </div>
  <div class="flex-h row btn-row">
    <el-button class="search-btn mt-10" size="small" type="primary" @click="runInterval" :disabled="disabled">
      <Icon size="middle" iconName="retry" :loading="!!intervalFn" class="mr-5" />
      {{ intervalFn ? t("pause") : t("start") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDemandLogStore } from "@/store/modules/demand-log";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import { EntityType } from "../../data";
  import { TimeRanges, IntervalOpts } from "./data";
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
  const state = reactive<any>({
    instance: { value: "", label: "" },
    container: { value: "", label: "" },
    duration: { label: "From 30 minutes ago", value: 1800 },
    interval: { label: "30 seconds", value: 30 },
  });
  const disabled = ref<boolean>(true);
  /*global Nullable */
  const intervalFn = ref<Nullable<any>>(null);

  onMounted(() => {
    fetchSelectors();
  });

  async function fetchSelectors() {
    if (dashboardStore.entity !== EntityType[3].value) {
      await getInstances();
    }
    getContainers();
    if (intervalFn.value) {
      clearTimer();
    }
  }
  async function getContainers() {
    if (!(state.instance.id || (selectorStore.currentPod && selectorStore.currentPod.id))) {
      return;
    }
    const resp = await demandLogStore.getContainers(state.instance.id || selectorStore.currentPod.id);
    if (resp.errors) {
      disabled.value = true;
      ElMessage.error(resp.errors);
      return;
    }
    if (resp.data.containers.errorReason) {
      disabled.value = true;
      ElMessage.warning(resp.data.containers.errorReason);
      return;
    }
    if (demandLogStore.containers.length) {
      state.container = demandLogStore.containers[0];
      disabled.value = false;
    }
  }
  async function getInstances() {
    const resp = await demandLogStore.getInstances();
    if (resp.errors) {
      ElMessage.error(resp.errors);
      return;
    }
    state.instance = demandLogStore.instances[0];
  }
  function runInterval() {
    if (intervalFn.value) {
      clearTimer();
      return;
    }
    searchLogs();
    if (state.interval.value === 0) {
      return;
    }
    intervalFn.value = setInterval(searchLogs, state.interval.value * 1000);
    setTimeout(() => {
      clearTimer();
    }, state.duration.value * 1000);
  }
  function searchLogs() {
    let instance = "";
    if (dashboardStore.entity === EntityType[3].value) {
      instance = selectorStore.currentPod.id;
    }
    const serviceInstanceId = instance || (state.instance && state.instance.id) || "";
    demandLogStore.setLogCondition({
      serviceInstanceId,
      container: state.container.value,
      duration: rangeTime(),
      keywordsOfContent: keywordsOfContent.value.length ? keywordsOfContent.value : undefined,
      excludingKeywordsOfContent: excludingKeywordsOfContent.value.length
        ? excludingKeywordsOfContent.value
        : undefined,
    });
    if (!serviceInstanceId) {
      return;
    }
    queryLogs();
  }

  function rangeTime() {
    {
      const times = {
        start: getLocalTime(appStore.utc, new Date(new Date().getTime() - state.duration.value * 1000)),
        end: getLocalTime(appStore.utc, new Date()),
        step: "SECOND",
      };
      return {
        start: dateFormatStep(times.start, times.step, false),
        end: dateFormatStep(times.end, times.step, false),
        step: times.step,
      };
    }
  }

  async function queryLogs() {
    const res = await demandLogStore.getDemandLogs();
    if (res && res.errors) {
      ElMessage.error(res.errors);
    }
  }
  function changeField(type: string, opt: any) {
    clearTimer();
    // if (["limit"].includes(type)) {
    //   state[type] = opt;
    //   return;
    // }
    state[type] = opt[0];
    if (type === "instance") {
      getContainers();
    }
  }
  function removeContent(index: number) {
    const keywordsOfContentList = keywordsOfContent.value || [];
    keywordsOfContentList.splice(index, 1);
    demandLogStore.setLogCondition({
      keywordsOfContent: keywordsOfContentList,
    });
    contentStr.value = "";
    clearTimer();
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
    clearTimer();
  }
  function removeExcludeContent(index: number) {
    excludingKeywordsOfContent.value.splice(index, 1);
    demandLogStore.setLogCondition({
      excludingKeywordsOfContent: excludingKeywordsOfContent.value,
    });
    excludingContentStr.value = "";
    clearTimer();
  }
  function clearTimer() {
    if (!intervalFn.value) {
      return;
    }
    clearInterval(intervalFn.value);
    intervalFn.value = null;
  }
  onUnmounted(() => {
    clearTimer();
  });
  watch(
    () => selectorStore.currentService,
    () => {
      if (dashboardStore.entity === EntityType[0].value) {
        fetchSelectors();
        demandLogStore.setLogs("");
      }
    },
  );
  watch(
    () => [selectorStore.currentPod],
    () => {
      if (dashboardStore.entity === EntityType[3].value) {
        fetchSelectors();
        demandLogStore.setLogs("");
      }
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
    width: 120px;
  }

  .tips {
    color: #888;
  }

  .log-tag {
    width: 30%;
    border-style: unset;
    outline: 0;
    border: 1px solid $disabled-color;
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
    color: $font-color;
    border: 1px dashed #aaa;
    font-size: $font-size-smaller;
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

  .duration-range {
    width: 210px;
  }

  .btn-row {
    justify-content: flex-end;
  }

  .help {
    color: #999;
    cursor: pointer;
  }
</style>
