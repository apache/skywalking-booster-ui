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
  import { ref, onMounted, onUnmounted, nextTick } from "vue";
  import type { Trace, Span, Ref } from "@/types/trace";
  import { useTraceStore } from "@/store/modules/trace";
  import TreeGraph from "../D3Graph/utils/d3-trace-list";
  import { buildSegmentForest, collapseTree, getRefsAllNodes } from "../D3Graph/utils/helper";
  /* global Nullable */
  interface Props {
    trace: Trace;
    selectedMaxTimestamp: number;
    selectedMinTimestamp: number;
    minTimestamp: number;
    maxTimestamp: number;
  }
  const props = defineProps<Props>();
  const spansGraph = ref<HTMLDivElement | null>(null);
  const tree = ref<Nullable<any>>(null);
  const segmentId = ref<Span[]>([]);
  const refSpans = ref<Array<Ref>>([]);
  const fixSpansSize = ref<number>(0);
  const traceStore = useTraceStore();
  const rowHeight = 20; // must match child component vertical spacing

  onMounted(async () => {
    changeTree();
    if (!spansGraph.value) {
      return;
    }
    // Wait for DOM to be fully updated before initializing and drawing
    await nextTick();
    tree.value = new TreeGraph(spansGraph.value, selectSpan);
    tree.value.init(
      { label: "TRACE_ROOT", children: segmentId.value },
      getRefsAllNodes({ label: "TRACE_ROOT", children: segmentId.value }),
      fixSpansSize.value,
    );
    // Ensure the element has proper dimensions before drawing
    await nextTick();
    tree.value.draw();
    // Select root span initially
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
    tree.value = new TreeGraph(spansGraph.value, selectSpan);
    tree.value.init(
      { label: "TRACE_ROOT", children: segmentId.value },
      getRefsAllNodes({ label: "TRACE_ROOT", children: segmentId.value }),
      fixSpansSize.value,
    );
    await nextTick();
    tree.value.draw();
    // Reselect root span after redraw
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
