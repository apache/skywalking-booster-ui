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
  <div class="detail-section-span">
    <div class="detail-section">
      <div class="detail-item">
        <span class="grey mr-10">{{ t("serviceName") }}</span>
        <span class="value">{{ currentSpan?.serviceCode || "Unknown" }}</span>
      </div>
      <div class="detail-item">
        <span class="grey mr-10">{{ t("endpointName") }}</span>
        <span class="value">{{ currentSpan?.endpointName || "Unknown" }}</span>
      </div>
      <div class="detail-item">
        <span class="grey mr-10">{{ t("instance") }}</span>
        <span class="value">{{ currentSpan?.serviceInstanceName || "Unknown" }}</span>
      </div>
      <div class="detail-item">
        <span class="grey mr-10">{{ t("component") }}</span>
        <span class="value">{{ currentSpan?.component || "Unknown" }}</span>
      </div>
    </div>
    <h4>{{ t("tags") }}</h4>
    <div
      class="tags-section flex-v scroll_bar_style"
      v-if="currentSpan?.tags && Object.keys(currentSpan.tags).length > 0"
    >
      <div v-for="tag in currentSpan.tags" :key="tag.key" class="tag-item">
        <span class="grey" style="width: 200px">{{ tag.key }}</span>
        <span class="value">{{ tag.value }}</span>
      </div>
    </div>
    <div v-else class="no-data">No tags available</div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { useTraceStore } from "@/store/modules/trace";

  const { t } = useI18n();
  const traceStore = useTraceStore();
  const currentSpan = computed(() => traceStore.currentSpan);
</script>

<style lang="scss" scoped>
  h4 {
    margin: 20px 0 10px;
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 5px;
  }

  h4:first-child {
    margin-top: 0;
  }

  .detail-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .detail-item {
    display: inline-flex;
    flex-direction: column;
    padding-top: 5px;
  }

  .value {
    word-break: break-all;
  }

  .tags-section {
    max-height: calc(100vh - 360px);
    min-height: 200px;
    overflow: auto;
    padding-right: 5px;
  }

  .no-data {
    color: var(--el-text-color-placeholder);
    font-style: italic;
    text-align: center;
    padding: 20px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
    border: 1px dashed var(--el-border-color-light);
  }

  .detail-section-span {
    width: 35%;
    overflow: auto;
    border-left: 1px solid var(--el-border-color-light);
    padding: 10px 0 0 10px;
  }

  .tag-item {
    display: inline-flex;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }
</style>
