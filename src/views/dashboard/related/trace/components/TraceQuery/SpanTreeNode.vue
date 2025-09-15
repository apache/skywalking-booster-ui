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
  <g :transform="`translate(${indentX}, 0)`">
    <rect :x="`${startPct}%`" :y="0" :width="`${widthPct}%`" :height="barHeight" :fill="barColor" rx="2" ry="2" />
    <!-- Children -->
    <g v-if="span.spans && span.spans.length > 0">
      <SpanTreeNode
        v-for="(child, idx) in span.spans"
        :key="child.id"
        :transform="`translate(0, ${(idx + 1) * rowHeight})`"
        :span="child"
        :trace="trace"
      />
    </g>
  </g>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import type { ZipkinTrace } from "@/types/trace";
  import { getServiceColor } from "./color";

  interface Props {
    span: ZipkinTrace;
    trace: ZipkinTrace;
  }

  const props = defineProps<Props>();
  const rowHeight = 16; // px per row
  const barHeight = 3; // px bar height

  // Calculate max duration for timeline
  const maxDuration = computed(() => {
    if (!props.trace.spans.length) return 1;
    const durations = props.trace.spans.map((trace: ZipkinTrace) => trace.duration || 0);
    return Math.max(...durations);
  });

  // Build lookup for parent relationships to compute depth (like d.y derived from depth)
  const idToSpan = computed(() => {
    const map = new Map<string, ZipkinTrace>();
    for (const s of props.trace.spans) {
      map.set(s.id, s);
    }
    return map;
  });

  const getDepth = (span: ZipkinTrace): number => {
    let depth = 0;
    let current = span;
    const visited = new Set<string>();
    while (current.parentId) {
      if (visited.has(current.parentId)) break;
      visited.add(current.parentId);
      const parent = idToSpan.value.get(current.parentId);
      if (!parent) break;
      depth += 1;
      current = parent;
    }
    return depth;
  };

  const indentX = computed(() => getDepth(props.span) * 12);

  // Time range like xScale domain [0, max]
  const minTimestamp = computed(() => {
    if (!props.trace.spans.length) return 0;
    return Math.min(...props.trace.spans.map((s) => s.timestamp || 0));
  });

  // Map duration to width percentage, with max duration = 100%
  const widthScale = computed(() => {
    const max = maxDuration.value || 1;
    return (duration: number | undefined | null) => {
      const d = Math.max(0, duration || 0);
      return (d / max) * 100;
    };
  });
  const startPct = computed(() => {
    const start = ((props.span.timestamp || 0) - minTimestamp.value) / 1000;
    return Math.max(0, widthScale.value(start));
  });

  const widthPct = computed(() => {
    const dur = props.span.duration || 0;
    return Math.max(0, widthScale.value(dur));
  });

  const barColor = computed(() => {
    const serviceName = props.span.localEndpoint?.serviceName || "";
    return getServiceColor(serviceName);
  });
</script>

<style lang="scss" scoped>
  .trace-timeline-item {
    justify-content: space-between;
    padding: 4px 0;
  }

  .span-label {
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: $font-size-smaller;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    // border-bottom: 1px solid var(--sw-trace-line);
  }

  .span-bar {
    height: 3px;
    border-radius: 2px;
    width: 100%;
  }

  .span-line {
    height: 12px;
    width: 1px;
    // border-right: 1px solid var(--sw-trace-line);
  }

  .trace-timeline-children {
    margin-left: 20px;
    // border-left: 1px solid var(--sw-trace-line);
    padding-left: 10px;
  }
</style>
