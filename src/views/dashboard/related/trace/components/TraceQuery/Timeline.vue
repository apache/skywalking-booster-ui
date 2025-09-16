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
  <div class="trace-timeline flex-v">
    <svg width="100%" :height="`${totalHeight + rowHeight}px`">
      <g
        v-for="item in flattenedSpans"
        :key="item.span.id"
        :transform="`translate(0, ${item.y + rowHeight})`"
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
        <SpanTreeNode :span="item.span" :trace="trace" :depth="item.depth" :showDuration="true" :showLabel="true" />
      </g>
    </svg>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, watch, onMounted, nextTick } from "vue";
  import type { ZipkinTrace } from "@/types/trace";
  import SpanTreeNode from "./SpanTreeNode.vue";
  import { useTraceStore } from "@/store/modules/trace";

  interface Props {
    trace: ZipkinTrace;
  }

  const props = defineProps<Props>();
  const traceStore = useTraceStore();
  const rowHeight = 25; // must match child component vertical spacing

  // Build tree structure based on parent-child relationships
  const treeSpans = computed(() => {
    const spans = props.trace.spans;
    if (!spans.length) return [];

    // Check if spans already have nested structure
    const hasNestedSpans = spans.some((span) => span.spans && span.spans.length > 0);

    if (hasNestedSpans) {
      // Data is already in tree structure, just sort by duration
      const sortedSpans = [...spans].sort((a, b) => (b.duration || 0) - (a.duration || 0));
      return sortedSpans;
    }

    // Build tree from flat structure
    // Create a map for quick span lookup
    const spanMap = new Map<string, ZipkinTrace>();
    for (const span of spans) {
      spanMap.set(span.id, span);
    }

    // Find root spans (spans without parentId or parentId not in current trace)
    const rootSpans: ZipkinTrace[] = [];
    const processedSpans = new Set<string>();

    for (const span of spans) {
      if (!span.parentId || !spanMap.has(span.parentId)) {
        rootSpans.push(span);
        processedSpans.add(span.id);
      }
    }

    // Recursive function to build tree structure
    const buildTree = (parentSpan: ZipkinTrace): ZipkinTrace => {
      const children = spans.filter((span) => span.parentId === parentSpan.id && !processedSpans.has(span.id));

      // Mark children as processed
      for (const child of children) {
        processedSpans.add(child.id);
      }

      // Sort children by duration in descending order
      children.sort((a, b) => (b.duration || 0) - (a.duration || 0));

      // Recursively build children trees
      const treeChildren = children.map((child) => buildTree(child));

      return {
        ...parentSpan,
        spans: treeChildren,
      };
    };

    // Build tree for each root span
    const treeRoots = rootSpans.map((rootSpan) => buildTree(rootSpan));

    // Sort root spans by duration in descending order
    treeRoots.sort((a, b) => (b.duration || 0) - (a.duration || 0));

    return treeRoots;
  });

  // Calculate total height needed for all spans
  const totalHeight = computed(() => {
    const countSpans = (spans: ZipkinTrace[]): number => {
      let count = spans.length;
      for (const span of spans) {
        if (span.spans && span.spans.length > 0) {
          count += countSpans(span.spans);
        }
      }
      return count;
    };
    return countSpans(treeSpans.value) * rowHeight;
  });

  // Flatten tree structure for rendering
  const flattenedSpans = computed(() => {
    const result: Array<{ span: ZipkinTrace; depth: number; y: number }> = [];
    let currentY = 0;

    const flatten = (spans: ZipkinTrace[], depth: number = 0) => {
      for (const span of spans) {
        result.push({ span, depth, y: currentY });
        currentY += rowHeight;

        if (span.spans && span.spans.length > 0) {
          flatten(span.spans, depth + 1);
        }
      }
    };

    flatten(treeSpans.value);
    return result;
  });
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
  function selectSpan(span: ZipkinTrace) {
    traceStore.setCurrentSpan(span);
  }
  function isSelected(span: ZipkinTrace) {
    return !!traceStore.currentSpan && traceStore.currentSpan.id === span.id;
  }
</script>
<style lang="scss" scoped>
  .trace-timeline {
    width: 100%;
    height: calc(100% - 210px);
    overflow: auto;
    padding-right: 20px;
  }

  .trace-timeline-span.selected {
    outline: 1px solid var(--el-color-primary);
    outline-offset: -1px;
  }
</style>
