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
  <rect
    :transform="`translate(${indentX}, 0)`"
    :x="`${startPct}%`"
    :y="0"
    :width="`${widthPct}%`"
    :height="barHeight"
    :fill="barColor"
    rx="2"
    ry="2"
  />
  <!-- Label and Duration Text -->
  <text
    v-if="showLabel"
    :transform="`translate(${indentX}, 0)`"
    :x="0"
    :y="barHeight - 7"
    font-size="10"
    fill="var(--sw-font-grey-color)"
    text-anchor="start"
    class="span-label"
  >
    {{ span.label || "Unknown" }}
  </text>
  <text
    v-if="showDuration"
    :x="`${100}%`"
    :y="barHeight - 7"
    font-size="10"
    fill="var(--sw-font-grey-color)"
    text-anchor="end"
    class="span-duration"
  >
    {{ span.duration }}ms
  </text>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import type { ZipkinTrace } from "@/types/trace";
  import { getServiceColor } from "./color";

  interface Props {
    span: ZipkinTrace;
    trace: ZipkinTrace;
    depth?: number;
    showDuration?: boolean;
    showLabel?: boolean;
  }

  const props = defineProps<Props>();
  const barHeight = 3; // px bar height

  // Calculate max duration for timeline
  const maxDuration = computed(() => {
    if (!props.trace.spans.length) return 1;
    const durations = props.trace.spans.map((trace: ZipkinTrace) => trace.duration || 0);
    return Math.max(...durations);
  });

  // Use depth from props, default to 0 if not provided
  const indentX = computed(() => (props.depth || 0) * 12);

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
  .span-label {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 500;
  }

  .span-duration {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-weight: 400;
  }
</style>
