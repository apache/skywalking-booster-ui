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
          <span class="value">{{ trace.serviceCode || "Unknown" }}</span>
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
      <div class="detail-section-timeline flex-v" :style="{ width: spanPanelVisible ? '65%' : '100%' }">
        <MinTimeline
          v-show="minTimelineVisible"
          :trace="trace"
          :minTimestamp="minTimestamp"
          :maxTimestamp="maxTimestamp"
          @updateSelectedMaxTimestamp="handleSelectedMaxTimestamp"
          @updateSelectedMinTimestamp="handleSelectedMinTimestamp"
        />
        <TimelineTool @toggleSpanPanel="toggleSpanPanel" @toggleMinTimeline="toggleMinTimeline" />
        <SpansTree
          :trace="trace"
          :minTimestamp="minTimestamp"
          :maxTimestamp="maxTimestamp"
          :selectedMaxTimestamp="selectedMaxTimestamp"
          :selectedMinTimestamp="selectedMinTimestamp"
        />
      </div>
      <SpanDetails v-show="spanPanelVisible" />
    </div>
    <!-- Spans Table Drawer -->
    <SpansTableDrawer
      v-model:visible="spansTableVisible"
      :spans="trace.spans || []"
      :trace-id="trace.traceId"
      @viewSpan="handleViewSpan"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { ArrowDown } from "@element-plus/icons-vue";
  import type { Trace, Span } from "@/types/trace";
  import SpansTableDrawer from "./SpansTableDrawer.vue";
  import SpansTree from "./SpansTree.vue";
  import MinTimeline from "./MinTimeline.vue";
  import SpanDetails from "./SpanDetails.vue";
  import { saveFileAsJSON } from "@/utils/file";
  import { useTraceStore } from "@/store/modules/trace";
  import TimelineTool from "./TimelineTool.vue";

  interface Props {
    trace: Trace;
  }

  const { t } = useI18n();
  const props = defineProps<Props>();
  const spansTableVisible = ref<boolean>(false);
  const traceStore = useTraceStore();
  // Time range like xScale domain [0, max]
  const minTimestamp = computed(() => {
    if (!props.trace.spans.length) return 0;
    return Math.min(...props.trace.spans.map((s) => s.startTime || 0));
  });

  const maxTimestamp = computed(() => {
    const timestamps = props.trace.spans.map((span) => span.endTime || 0);
    if (timestamps.length === 0) return 0;

    return Math.max(...timestamps);
  });
  const selectedMaxTimestamp = ref<number>(maxTimestamp.value);
  const selectedMinTimestamp = ref<number>(minTimestamp.value);
  const spanPanelVisible = ref<boolean>(true);
  const minTimelineVisible = ref<boolean>(true);

  function showSpansTable() {
    spansTableVisible.value = true;
  }

  function handleSelectedMaxTimestamp(value: number) {
    selectedMaxTimestamp.value = value;
  }

  function handleSelectedMinTimestamp(value: number) {
    selectedMinTimestamp.value = value;
  }

  function toggleSpanPanel() {
    spanPanelVisible.value = !spanPanelVisible.value;
  }

  function toggleMinTimeline() {
    minTimelineVisible.value = !minTimelineVisible.value;
  }

  function handleDownload() {
    const trace = props.trace;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const baseFilename = `trace-${trace.traceId}-${timestamp}`;
    const spans = trace.spans.map((span) => {
      const { duration, label, ...newSpan } = span;
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

  function handleViewSpan(span: Span) {
    traceStore.setCurrentSpan(span);
    spansTableVisible.value = false;
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

  .detail-section-timeline {
    width: 65%;
  }
</style>
