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
  import type { Trace } from "@/types/trace";
  import SpanTreeNode from "./SpanTreeNode.vue";
  import MinTimelineMarker from "./MinTimelineMarker.vue";
  import MinTimelineOverlay from "./MinTimelineOverlay.vue";
  import MinTimelineSelector from "./MinTimelineSelector.vue";
  import { buildSpanTree, countTreeNodes, flattenTree } from "./helper";

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
  const totalHeight = computed(() => countTreeNodes(treeSpans.value) * rowHeight);

  // Build tree structure based on parent-child relationships
  const treeSpans = computed(() => buildSpanTree(props.trace.spans));
  // Flatten tree structure for rendering
  const flattenedSpans = computed(() => flattenTree(treeSpans.value, rowHeight));
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
