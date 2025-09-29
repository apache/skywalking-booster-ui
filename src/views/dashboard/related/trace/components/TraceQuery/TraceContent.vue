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
        <div class="flex-h">
          <div class="mr-5 cp">
            <el-button size="small" @click="viewTrace">
              {{ t("shareTrace") }}
              <Icon class="ml-5" size="small" iconName="link" />
            </el-button>
          </div>
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
        <div class="trace-id-container flex-h" style="align-items: center">
          <span class="grey mr-5">{{ t("traceID") }}</span>
          <span class="value">{{ trace.traceId }}</span>
          <span class="value ml-5 cp" @click="handleCopyTraceId">
            <Icon size="middle" iconName="copy" />
          </span>
        </div>
      </div>
    </div>
    <div class="flex-h">
      <div class="detail-section-timeline flex-v">
        <MinTimeline
          v-show="minTimelineVisible"
          :trace="trace"
          :minTimestamp="minTimestamp"
          :maxTimestamp="maxTimestamp"
          @updateSelectedMaxTimestamp="handleSelectedMaxTimestamp"
          @updateSelectedMinTimestamp="handleSelectedMinTimestamp"
        />
        <TimelineTool @toggleMinTimeline="toggleMinTimeline" @updateSpansGraphType="handleSpansGraphTypeUpdate" />
        <component
          v-if="traceStore.currentTrace?.endpointNames"
          :is="graphs[spansGraphType as keyof typeof graphs]"
          :data="trace.spans"
          :traceId="traceStore.currentTrace?.traceId"
          :showBtnDetail="false"
          :headerType="WidgetType.Trace"
          :selectedMaxTimestamp="selectedMaxTimestamp"
          :selectedMinTimestamp="selectedMinTimestamp"
          :minTimestamp="minTimestamp"
          :maxTimestamp="maxTimestamp"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { ArrowDown } from "@element-plus/icons-vue";
  import type { Trace } from "@/types/trace";
  import MinTimeline from "./MinTimeline.vue";
  import { saveFileAsJSON } from "@/utils/file";
  import { useTraceStore } from "@/store/modules/trace";
  import TimelineTool from "./TimelineTool.vue";
  import graphs from "../VisGraph/index";
  import { WidgetType } from "@/views/dashboard/data";
  import { GraphTypeOptions } from "../VisGraph/constant";
  import copy from "@/utils/copy";
  import router from "@/router";

  interface Props {
    trace: Trace;
  }

  const { t } = useI18n();
  const props = defineProps<Props>();
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
  const minTimelineVisible = ref<boolean>(true);
  const spansGraphType = ref<string>(GraphTypeOptions[2].value);

  function handleSelectedMaxTimestamp(value: number) {
    selectedMaxTimestamp.value = value;
  }

  function handleSelectedMinTimestamp(value: number) {
    selectedMinTimestamp.value = value;
  }

  function toggleMinTimeline() {
    minTimelineVisible.value = !minTimelineVisible.value;
  }

  function handleSpansGraphTypeUpdate(value: string) {
    spansGraphType.value = value;
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
  function viewTrace() {
    if (!traceStore.currentTrace?.traceId) return;
    const traceUrl = `/traces/${traceStore.currentTrace.traceId}`;
    const routeUrl = router.resolve({ path: traceUrl });

    window.open(routeUrl.href, "_blank");
  }
  function handleCopyTraceId() {
    if (!traceStore.currentTrace?.traceId) return;
    copy(traceStore.currentTrace?.traceId);
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
    width: 100%;
  }
</style>
