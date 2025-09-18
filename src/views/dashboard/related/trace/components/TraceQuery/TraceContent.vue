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
  <div class="trace-query-content">
    <div class="trace-info">
      <div class="flex-h" style="justify-content: space-between">
        <h3>{{ trace.label }}</h3>
        <div>
          <el-button class="mr-10" size="small" @click="showSpansTable">{{ t("spansTable") }}</el-button>
          <el-dropdown @command="handleDownload" trigger="click">
            <el-button size="small">
              {{ t("download") }}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="json">Download JSON</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="trace-meta flex-h">
        <div>
          <span class="grey mr-5">{{ t("duration") }}</span>
          <span class="value">{{ trace.duration }}ms</span>
        </div>
        <div>
          <span class="grey mr-5">{{ t("services") }}</span>
          <span class="value">{{ trace.localEndpoint?.serviceName || "Unknown" }}</span>
        </div>
        <div>
          <span class="grey mr-5">{{ t("totalSpans") }}</span>
          <span class="value">{{ trace.spans?.length || 0 }}</span>
        </div>
        <div>
          <span class="grey mr-5">{{ t("traceID") }}</span>
          <span class="value">{{ trace.traceId }}</span>
        </div>
      </div>
    </div>
    <div class="flex-h">
      <div class="detail-section-timeline flex-v">
        <MinTimeline :trace="trace" />
        <Timeline :trace="trace" />
      </div>
      <div class="detail-section-span">
        <div class="detail-section">
          <div class="detail-item">
            <span class="grey mr-10">{{ t("serviceName") }}</span>
            <span class="value">{{ currentSpan?.localEndpoint?.serviceName || "Unknown" }}</span>
          </div>
          <div class="detail-item">
            <span class="grey mr-10">{{ t("spanName") }}</span>
            <span class="value">{{ currentSpan?.name || "Unknown" }}</span>
          </div>
          <div class="detail-item">
            <span class="grey mr-10">{{ t("spanId") }}</span>
            <span class="value">{{ currentSpan?.id || "-" }}</span>
          </div>
          <div class="detail-item">
            <span class="grey mr-10">{{ t("parentId") }}</span>
            <span class="value">{{ currentSpan?.parentId || "none" }}</span>
          </div>
        </div>
        <h4>{{ t("tags") }}</h4>
        <div
          class="tags-section flex-v scroll_bar_style"
          v-if="currentSpan?.tags && Object.keys(currentSpan.tags).length > 0"
        >
          <div v-for="(value, key) in currentSpan.tags" :key="key" class="tag-item">
            <span class="grey" style="width: 200px">{{ key }}</span>
            <span class="value">{{ value }}</span>
          </div>
        </div>
        <div v-else class="no-data">No tags available</div>
      </div>
    </div>
    <!-- Spans Table Drawer -->
    <SpansTableDrawer v-model:visible="spansTableVisible" :spans="trace.spans || []" :trace-id="trace.traceId" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { ArrowDown } from "@element-plus/icons-vue";
  import type { ZipkinTrace } from "@/types/trace";
  import SpansTableDrawer from "./SpansTableDrawer.vue";
  import Timeline from "./Timeline.vue";
  import MinTimeline from "./MinTimeline.vue";
  import { saveFileAsJSON } from "@/utils/file";
  import { useTraceStore } from "@/store/modules/trace";

  interface Props {
    trace: ZipkinTrace;
  }

  const { t } = useI18n();
  const props = defineProps<Props>();
  const spansTableVisible = ref<boolean>(false);
  const traceStore = useTraceStore();
  const currentSpan = computed(() => traceStore.currentSpan);

  function showSpansTable() {
    spansTableVisible.value = true;
  }

  function handleDownload() {
    const trace = props.trace;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseFilename = `trace-${trace.traceId}-${timestamp}`;
    const spans = trace.spans.map((span) => {
      const newSpan = {
        ...span,
        duration: span.originalDuration,
      };
      delete newSpan.originalDuration;
      delete newSpan.label;
      return newSpan;
    });
    try {
      saveFileAsJSON(spans, `${baseFilename}.json`);
      ElMessage.success("Trace data downloaded as JSON");
    } catch (error) {
      console.error("Download error:", error);
      ElMessage.error("Failed to download file");
    }
  }
</script>

<style lang="scss" scoped>
  .trace-info {
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .trace-info h3 {
    margin: 0 0 10px;
    color: var(--el-text-color-primary);
    font-size: 18px;
    font-weight: 600;
  }

  .trace-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

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
    max-height: calc(100vh - 330px);
    min-height: 200px;
    overflow: auto;
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

  .detail-section-timeline {
    width: 65%;
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
