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
  <div class="trace-min-timeline flex-v">
    <svg ref="svgEle" width="100%" :height="`${totalHeight + rowHeight}px`">
      <MinTimelineMarker :minTimestamp="minTimestamp" :maxTimestamp="maxTimestamp" />
      <MinTimelineOverlay
        :minTimestamp="minTimestamp"
        :maxTimestamp="maxTimestamp"
        @setSelectedMinTimestamp="setSelectedMinTimestamp"
        @setSelectedMaxTimestamp="setSelectedMaxTimestamp"
      />
      <MinTimelineSelector
        :minTimestamp="minTimestamp"
        :maxTimestamp="maxTimestamp"
        :selectedMinTimestamp="selectedMinTimestamp"
        :selectedMaxTimestamp="selectedMaxTimestamp"
        @setSelectedMinTimestamp="setSelectedMinTimestamp"
        @setSelectedMaxTimestamp="setSelectedMaxTimestamp"
      />
      <g v-for="item in flattenedSpans" :key="item.span.id" :transform="`translate(0, ${item.y + rowHeight})`">
        <SpanTreeNode :span="item.span" :minTimestamp="minTimestamp" :maxTimestamp="maxTimestamp" :depth="item.depth" />
      </g>
    </svg>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import type { Trace, Span } from "@/types/trace";
  import SpanTreeNode from "./SpanTreeNode.vue";
  import MinTimelineMarker from "./MinTimelineMarker.vue";
  import MinTimelineOverlay from "./MinTimelineOverlay.vue";
  import MinTimelineSelector from "./MinTimelineSelector.vue";

  interface Props {
    trace: Trace;
    minTimestamp: number;
    maxTimestamp: number;
  }

  const props = defineProps<Props>();
  const svgEle = ref<SVGSVGElement | null>(null);
  const rowHeight = 12;

  const selectedMinTimestamp = ref<number>(props.minTimestamp);
  const selectedMaxTimestamp = ref<number>(props.maxTimestamp);

  // Calculate total height needed for all spans
  const totalHeight = computed(() => {
    const countSpans = (spans: Span[]): number => {
      let count = spans.length;
      for (const span of spans) {
        if (span.children && span.children.length > 0) {
          count += countSpans(span.children);
        }
      }
      return count;
    };
    console.log(countSpans(treeSpans.value) * rowHeight);
    return countSpans(treeSpans.value) * rowHeight;
  });

  // Build tree structure based on parent-child relationships
  const treeSpans = computed(() => {
    const spans = props.trace.spans;
    if (!spans.length) return [];

    // Check if spans already have nested structure
    const hasNestedSpans = spans.some((span) => span.children && span.children.length > 0);

    if (hasNestedSpans) {
      // Data is already in tree structure, just sort by duration
      const sortedSpans = [...spans].sort((a, b) => (b.duration || 0) - (a.duration || 0));
      return sortedSpans;
    }

    // Build tree from flat structure
    // Create a map for quick span lookup
    const spanMap = new Map<string, Span>();
    for (const span of spans) {
      spanMap.set(span.id, span);
    }

    // Find root spans (spans without parentId or parentId not in current trace)
    const rootSpans: Span[] = [];
    const processedSpans = new Set<string>();

    for (const span of spans) {
      if (!span.parentId || !spanMap.has(span.parentId)) {
        rootSpans.push(span);
        processedSpans.add(span.id);
      }
    }

    // Recursive function to build tree structure
    const buildTree = (parentSpan: Span): Span => {
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
        children: treeChildren,
      };
    };

    // Build tree for each root span
    const treeRoots = rootSpans.map((rootSpan) => buildTree(rootSpan));

    // Sort root spans by duration in descending order
    treeRoots.sort((a, b) => (b.duration || 0) - (a.duration || 0));

    return treeRoots;
  });
  // Flatten tree structure for rendering
  const flattenedSpans = computed(() => {
    const result: Array<{ span: Span; depth: number; y: number }> = [];
    let currentY = 0;

    const flatten = (spans: Span[], depth: number = 0) => {
      for (const span of spans) {
        result.push({ span, depth, y: currentY });
        currentY += rowHeight;

        if (span.children && span.children.length > 0) {
          flatten(span.children, depth + 1);
        }
      }
    };

    flatten(treeSpans.value);
    return result;
  });
  const emit = defineEmits(["updateSelectedMaxTimestamp", "updateSelectedMinTimestamp"]);

  const setSelectedMinTimestamp = (value: number) => {
    selectedMinTimestamp.value = value;
    emit("updateSelectedMinTimestamp", value);
  };
  const setSelectedMaxTimestamp = (value: number) => {
    selectedMaxTimestamp.value = value;
    emit("updateSelectedMaxTimestamp", value);
  };
</script>
<style lang="scss" scoped>
  .trace-min-timeline {
    width: 100%;
    padding-right: 20px;
    padding-top: 5px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
</style>
