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
    <svg width="100%" :height="`${totalHeight + rowHeight}px`">
      <MinTimelineMarker :trace="trace" />
      <g v-for="item in flattenedSpans" :key="item.span.id" :transform="`translate(0, ${item.y + rowHeight})`">
        <SpanTreeNode :span="item.span" :trace="trace" :depth="item.depth" />
      </g>
    </svg>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { ZipkinTrace } from "@/types/trace";
  import SpanTreeNode from "./SpanTreeNode.vue";
  import MinTimelineMarker from "./MinTimelineMarker.vue";

  interface Props {
    trace: ZipkinTrace;
  }

  const props = defineProps<Props>();
  const rowHeight = 15;

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

  // Build tree structure based on parent-child relationships
  const treeSpans = computed(() => {
    const spans = props.trace.spans;
    if (!spans.length) return [];

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
</script>
<style lang="scss" scoped>
  .trace-min-timeline {
    width: 100%;
    height: 190px;
    overflow: auto;
    padding-right: 20px;
    padding-top: 5px;
    border-bottom: 1px solid var(--el-border-color-light);
  }
</style>
