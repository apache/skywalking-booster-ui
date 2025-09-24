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
  <div class="trace-timeline flex-v" :style="{ height: `calc(100% - ${containerHeightOffset}px)` }">
    <svg width="100%" :height="`${totalHeight + rowHeight}px`">
      <MinTimelineMarker :minTimestamp="selectedMinTimestamp" :maxTimestamp="selectedMaxTimestamp" :lineHeight="15" />
      <g
        v-for="item in flattenedSpans"
        :key="item.span.id"
        :transform="`translate(0, ${item.y + rowHeight + 12})`"
        :style="{ cursor: 'pointer' }"
        @click="selectSpan(item.span)"
        class="trace-timeline-span"
      >
        <rect
          x="0"
          y="-16"
          width="100%"
          :height="rowHeight"
          :fill="isSelected(item.span) ? 'var(--el-color-primary-light-9)' : 'transparent'"
        />
        <line x1="0" y1="2" x2="100%" y2="2" stroke="var(--el-border-color-light)" />
        <SpanTreeNode
          :span="item.span"
          :minTimestamp="minTimestamp"
          :maxTimestamp="maxTimestamp"
          :depth="item.depth"
          :selectedMaxTimestamp="selectedMaxTimestamp"
          :selectedMinTimestamp="selectedMinTimestamp"
          :showDuration="true"
          :showLabel="true"
        />
      </g>
    </svg>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, watch, onMounted, nextTick } from "vue";
  import type { Trace, Span } from "@/types/trace";
  import SpanTreeNode from "./SpanTreeNode.vue";
  import { useTraceStore } from "@/store/modules/trace";
  import MinTimelineMarker from "./MinTimelineMarker.vue";
  import { buildSpanTree, countTreeNodes, flattenTree } from "./helper";

  interface Props {
    trace: Trace;
    selectedMaxTimestamp: number;
    selectedMinTimestamp: number;
    minTimestamp: number;
    maxTimestamp: number;
    containerHeightOffset?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    containerHeightOffset: 200,
  });
  const traceStore = useTraceStore();
  const rowHeight = 25; // must match child component vertical spacing

  // Build tree structure based on parent-child relationships
  const treeSpans = computed(() => buildSpanTree(props.trace.spans));

  // Calculate total height needed for all spans
  const totalHeight = computed(() => countTreeNodes(treeSpans.value) * rowHeight);

  // Flatten tree structure for rendering
  const flattenedSpans = computed(() => flattenTree(treeSpans.value, rowHeight));
  // Auto-select the first span after initialization
  const initialized = ref(false);
  watch(
    () => flattenedSpans.value,
    (spans) => {
      if (initialized.value) return;
      if (spans && spans.length > 0) {
        traceStore.setCurrentSpan(spans[0].span);
        initialized.value = true;
      }
    },
    { immediate: false, deep: false },
  );

  onMounted(async () => {
    await nextTick();
    if (!initialized.value && flattenedSpans.value && flattenedSpans.value.length > 0) {
      traceStore.setCurrentSpan(flattenedSpans.value[0].span);
      initialized.value = true;
    }
  });

  function selectSpan(span: Span) {
    traceStore.setCurrentSpan(span);
  }
  function isSelected(span: Span) {
    return !!traceStore.currentSpan && traceStore.currentSpan.id === span.id;
  }
</script>
<style lang="scss" scoped>
  .trace-timeline {
    width: 100%;
    height: calc(100% - 200px);
    overflow: auto;
    padding-right: 20px;
    border-top: 1px solid var(--el-border-color-light);
  }

  .trace-timeline-span.selected {
    outline: 1px solid var(--el-color-primary);
    outline-offset: -1px;
  }
</style>
