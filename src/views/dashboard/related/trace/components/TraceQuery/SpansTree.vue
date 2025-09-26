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
  <div
    class="trace-timeline"
    ref="spansGraph"
    :style="{ width: `100%`, height: `${(fixSpansSize + 1) * rowHeight}px` }"
  ></div>
</template>
<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
  import type { Trace, Span, Ref } from "@/types/trace";
  import { useTraceStore } from "@/store/modules/trace";
  import TreeGraph from "../D3Graph/utils/d3-trace-list";
  import { buildSegmentForest, collapseTree, getRefsAllNodes } from "../D3Graph/utils/helper";
  import { debounce } from "@/utils/debounce";
  /* global Nullable */
  interface Props {
    trace: Trace;
    selectedMaxTimestamp: number;
    selectedMinTimestamp: number;
    minTimestamp: number;
    maxTimestamp: number;
  }
  const props = defineProps<Props>();
  const traceStore = useTraceStore();
  const spansGraph = ref<HTMLDivElement | null>(null);
  const tree = ref<Nullable<any>>(null);
  const segmentId = ref<Span[]>([]);
  const refSpans = ref<Array<Ref>>([]);
  const fixSpansSize = ref<number>(0);
  const currentSpan = () => traceStore.currentSpan;
  const rowHeight = 20; // must match child component vertical spacing

  // Store previous timestamp values to check for significant changes
  const prevSelectedMaxTimestamp = ref<number>(props.selectedMaxTimestamp);
  const prevSelectedMinTimestamp = ref<number>(props.selectedMinTimestamp);

  // Debounced version of onSpanPanelToggled to prevent excessive re-renders
  const debouncedOnSpanPanelToggled = debounce(onSpanPanelToggled, 150);

  // Check if timestamp change is significant enough to warrant a redraw
  function isTimestampChangeSignificant(newMax: number, newMin: number): boolean {
    const maxDiff = Math.abs(newMax - prevSelectedMaxTimestamp.value);
    const minDiff = Math.abs(newMin - prevSelectedMinTimestamp.value);
    const totalRange = props.maxTimestamp - props.minTimestamp;

    // Consider change significant if it's more than 0.1% of the total range
    const threshold = totalRange * 0.001;

    return maxDiff > threshold || minDiff > threshold;
  }

  onMounted(async () => {
    changeTree();
    if (!spansGraph.value) {
      return;
    }
    // Wait for DOM to be fully updated before initializing and drawing
    await nextTick();
    tree.value = new TreeGraph({ el: spansGraph.value, handleSelectSpan: selectSpan });
    tree.value.init({
      data: { label: "TRACE_ROOT", children: segmentId.value },
      row: getRefsAllNodes({ label: "TRACE_ROOT", children: segmentId.value }),
      fixSpansSize: fixSpansSize.value,
      selectedMaxTimestamp: props.selectedMaxTimestamp,
      selectedMinTimestamp: props.selectedMinTimestamp,
    });
    // Ensure the element has proper dimensions before drawing
    await nextTick();
    tree.value.draw();
    selectInitialSpan();
    // Listen for layout changes triggered by span panel toggle and re-draw
    window.addEventListener("spanPanelToggled", onSpanPanelToggled);
  });

  onUnmounted(() => {
    window.removeEventListener("spanPanelToggled", onSpanPanelToggled);
  });

  async function onSpanPanelToggled() {
    // Recreate graph so it recalculates width/height based on new layout
    await nextTick();
    changeTree();
    if (!spansGraph.value) {
      return;
    }
    tree.value = new TreeGraph({ el: spansGraph.value, handleSelectSpan: selectSpan });
    tree.value.init({
      data: { label: "TRACE_ROOT", children: segmentId.value },
      row: getRefsAllNodes({ label: "TRACE_ROOT", children: segmentId.value }),
      fixSpansSize: fixSpansSize.value,
      selectedMaxTimestamp: props.selectedMaxTimestamp,
      selectedMinTimestamp: props.selectedMinTimestamp,
    });
    await nextTick();
    tree.value.draw();
    selectInitialSpan();
  }
  function changeTree() {
    if (props.trace.spans.length === 0) {
      return [];
    }
    const { roots, fixSpansSize: fixSize, refSpans: refs } = buildSegmentForest(props.trace.spans, props.trace.traceId);
    segmentId.value = roots as Span[];
    fixSpansSize.value = fixSize;
    refSpans.value = refs;
    for (const root of segmentId.value) {
      collapseTree(root as unknown as Span, refSpans.value);
    }
  }

  function selectSpan(span: any) {
    traceStore.setCurrentSpan(span.data);
    // Highlight selected node
    if (tree.value && typeof tree.value.highlightSpan === "function") {
      tree.value.highlightSpan(span.data);
    }
  }

  function selectInitialSpan() {
    if (segmentId.value && segmentId.value.length > 0) {
      const root = segmentId.value[0];
      traceStore.setCurrentSpan(root);
      if (tree.value && typeof tree.value.highlightSpan === "function") {
        tree.value.highlightSpan(root as any);
      }
    }
  }
  // React to external span selections (e.g., from SpansTableDrawer)
  watch(
    currentSpan,
    (span) => {
      if (!span || !tree.value || typeof tree.value.highlightSpan !== "function") return;
      tree.value.highlightSpan(span as any);
    },
    { deep: false },
  );
  watch(
    () => [props.selectedMaxTimestamp, props.selectedMinTimestamp],
    ([newMax, newMin]) => {
      // Only trigger redraw if the change is significant
      if (isTimestampChangeSignificant(newMax as number, newMin as number)) {
        // Update previous values
        prevSelectedMaxTimestamp.value = newMax as number;
        prevSelectedMinTimestamp.value = newMin as number;

        // Use debounced version to prevent excessive re-renders
        debouncedOnSpanPanelToggled();
      }
    },
  );
</script>
<style lang="scss" scoped>
  .trace-timeline {
    width: 100%;
    border-top: 1px solid var(--el-border-color-light);
  }

  .trace-timeline-span.selected {
    outline: 1px solid var(--el-color-primary);
    outline-offset: -1px;
  }
</style>
