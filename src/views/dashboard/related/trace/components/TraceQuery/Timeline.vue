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
    <div class="trace-timeline-item flex-v" v-for="span in sortedSpans" :key="span.id">
      <div class="span-label grey" :style="{ marginLeft: depthPx(span) }">{{ span.label }}</div>
      <div class="span-bar" :style="barStyle(span)"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { ZipkinTrace } from "@/types/trace";
  import { getServiceColor } from "./color";

  interface Props {
    trace: ZipkinTrace;
  }

  const props = defineProps<Props>();

  // Sort spans by duration in descending order
  const sortedSpans = computed(() => {
    return [...props.trace.spans].sort((a, b) => (b.duration || 0) - (a.duration || 0));
  });

  // Calculate max duration for timeline
  const maxDuration = computed(() => {
    if (!props.trace.spans.length) return 1;
    const durations = props.trace.spans.map((trace: ZipkinTrace) => trace.duration || 0);
    return Math.max(...durations);
  });

  // Build lookup for parent relationships to compute depth (like d.y derived from depth)
  const idToSpan = computed(() => {
    const map = new Map<string, ZipkinTrace>();
    props.trace.spans.forEach((s) => map.set(s.id, s));
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

  const depthPx = (span: ZipkinTrace): string => `${getDepth(span) * 12}px`;

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

  const barStyle = (span: ZipkinTrace) => {
    const start = ((span.timestamp || 0) - minTimestamp.value) / 1000;
    const dur = span.duration || 0;
    const widthPct = widthScale.value(dur);
    const serviceName = span.localEndpoint?.serviceName || "";
    const startLeft = widthScale.value(start);

    return {
      width: `${Math.max(0, widthPct)}%`,
      marginLeft: `${Math.max(0, startLeft)}%`,
      paddingRight: depthPx(span),
      backgroundColor: getServiceColor(serviceName),
    } as const;
  };
</script>
<style lang="scss" scoped>
  .trace-timeline {
    width: 100%;
    height: 100%;
    overflow: auto;
    padding-right: 20px;
  }

  .trace-timeline-item {
    justify-content: space-between;
    padding: 4px 0;
  }

  .span-label {
    flex: 0 0 61.3%;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: $font-size-smaller;
  }

  .span-bar {
    height: 4px;
    border-radius: 2px;
    width: 100%;
  }
</style>
