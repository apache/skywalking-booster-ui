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
  <div class="trace-t-loading" v-show="loading">
    <Icon iconName="spinner" size="sm" />
  </div>
  <div ref="traceGraph" class="d3-graph"></div>
  <el-dialog
    v-model="showDetail"
    :destroy-on-close="true"
    fullscreen
    @closed="showDetail = false"
  >
    <SpanDetail :currentSpan="currentSpan" />
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, onMounted } from "vue";
import type { PropType } from "vue";
import _ from "lodash";
import * as d3 from "d3";
import ListGraph from "../../utils/d3-trace-list";
import TreeGraph from "../../utils/d3-trace-tree";
import { Span } from "@/types/trace";
import SpanDetail from "./SpanDetail.vue";

/* global defineProps, Nullable, defineExpose*/
const props = defineProps({
  data: { type: Array as PropType<Span[]>, default: () => [] },
  traceId: { type: String, default: "" },
  type: { type: String, default: "List" },
});
const loading = ref<boolean>(false);
const showDetail = ref<boolean>(false);
const fixSpansSize = ref<number>(0);
const segmentId = ref<any>([]);
const currentSpan = ref<Array<Span>>([]);
const tree = ref<any>(null);
const traceGraph = ref<Nullable<HTMLDivElement>>(null);
defineExpose({
  tree,
});
onMounted(() => {
  loading.value = true;
  changeTree();
  if (!traceGraph.value) {
    loading.value = false;
    return;
  }
  if (props.type === "List") {
    tree.value = new ListGraph(traceGraph.value, handleSelectSpan);
    tree.value.init(
      { label: "TRACE_ROOT", children: segmentId.value },
      props.data,
      fixSpansSize.value
    );
    tree.value.draw();
  } else {
    tree.value = new TreeGraph(traceGraph.value, handleSelectSpan);
    tree.value.init(
      { label: `${props.traceId}`, children: segmentId.value },
      props.data
    );
  }
  loading.value = false;
  window.addEventListener("resize", resize);
});
function resize() {
  tree.value.resize();
}
function handleSelectSpan(i: any) {
  currentSpan.value = i.data;
  showDetail.value = true;
}
function traverseTree(node: any, spanId: string, segmentId: string, data: any) {
  if (!node || node.isBroken) {
    return;
  }
  if (node.spanId === spanId && node.segmentId === segmentId) {
    node.children.push(data);
    return;
  }
  if (node.children && node.children.length > 0) {
    node.children.forEach((nodeItem: any) => {
      traverseTree(nodeItem, spanId, segmentId, data);
    });
  }
}
function changeTree() {
  if (props.data.length === 0) {
    return [];
  }
  segmentId.value = [];
  const segmentGroup: any = {};
  const segmentIdGroup: any = [];
  const fixSpans: any[] = [];
  const segmentHeaders: any = [];
  for (const span of props.data) {
    if (span.parentSpanId === -1) {
      segmentHeaders.push(span);
    } else {
      const index = props.data.findIndex(
        (i: any) =>
          i.segmentId === span.segmentId && i.spanId === span.spanId - 1
      );
      const fixSpanKeyContent = {
        traceId: span.traceId,
        segmentId: span.segmentId,
        spanId: span.spanId - 1,
        parentSpanId: span.spanId - 2,
      };
      if (index === -1 && !_.find(fixSpans, fixSpanKeyContent)) {
        fixSpans.push({
          ...fixSpanKeyContent,
          refs: [],
          endpointName: `VNode: ${span.segmentId}`,
          serviceCode: "VirtualNode",
          type: `[Broken] ${span.type}`,
          peer: "",
          component: `VirtualNode: #${span.spanId - 1}`,
          isError: true,
          isBroken: true,
          layer: "Broken",
          tags: [],
          logs: [],
        });
      }
    }
  }
  segmentHeaders.forEach((span: Span) => {
    if (span.refs.length) {
      span.refs.forEach((ref) => {
        const index = props.data.findIndex(
          (i: any) =>
            ref.parentSegmentId === i.segmentId && ref.parentSpanId === i.spanId
        );
        if (index === -1) {
          // create a known broken node.
          const i = ref.parentSpanId;
          const fixSpanKeyContent = {
            traceId: ref.traceId,
            segmentId: ref.parentSegmentId,
            spanId: i,
            parentSpanId: i > -1 ? 0 : -1,
          };
          if (!_.find(fixSpans, fixSpanKeyContent)) {
            fixSpans.push({
              ...fixSpanKeyContent,
              refs: [],
              endpointName: `VNode: ${ref.parentSegmentId}`,
              serviceCode: "VirtualNode",
              type: `[Broken] ${ref.type}`,
              peer: "",
              component: `VirtualNode: #${i}`,
              isError: true,
              isBroken: true,
              layer: "Broken",
              tags: [],
              logs: [],
            });
          }
          // if root broken node is not exist, create a root broken node.
          if (fixSpanKeyContent.parentSpanId > -1) {
            const fixRootSpanKeyContent = {
              traceId: ref.traceId,
              segmentId: ref.parentSegmentId,
              spanId: 0,
              parentSpanId: -1,
            };
            if (!_.find(fixSpans, fixRootSpanKeyContent)) {
              fixSpans.push({
                ...fixRootSpanKeyContent,
                refs: [],
                endpointName: `VNode: ${ref.parentSegmentId}`,
                serviceCode: "VirtualNode",
                type: `[Broken] ${ref.type}`,
                peer: "",
                component: `VirtualNode: #0`,
                isError: true,
                isBroken: true,
                layer: "Broken",
                tags: [],
                logs: [],
              });
            }
          }
        }
      });
    }
  });
  [...fixSpans, ...props.data].forEach((i) => {
    i.label = i.endpointName || "no operation name";
    i.children = [];
    if (segmentGroup[i.segmentId] === undefined) {
      segmentIdGroup.push(i.segmentId);
      segmentGroup[i.segmentId] = [];
      segmentGroup[i.segmentId].push(i);
    } else {
      segmentGroup[i.segmentId].push(i);
    }
  });
  fixSpansSize.value = fixSpans.length;
  segmentIdGroup.forEach((id: string) => {
    const currentSegment = segmentGroup[id].sort(
      (a: Span, b: Span) => b.parentSpanId - a.parentSpanId
    );
    currentSegment.forEach((s: any) => {
      const index = currentSegment.findIndex(
        (i: Span) => i.spanId === s.parentSpanId
      );
      if (index !== -1) {
        if (
          (currentSegment[index].isBroken &&
            currentSegment[index].parentSpanId === -1) ||
          !currentSegment[index].isBroken
        ) {
          currentSegment[index].children.push(s);
          currentSegment[index].children.sort(
            (a: Span, b: Span) => a.spanId - b.spanId
          );
        }
      }
      if (s.isBroken) {
        const children = _.filter(props.data, (span: Span) => {
          return _.find(span.refs, {
            traceId: s.traceId,
            parentSegmentId: s.segmentId,
            parentSpanId: s.spanId,
          });
        });
        if (children.length > 0) {
          s.children.push(...children);
        }
      }
    });
    segmentGroup[id] = currentSegment[currentSegment.length - 1];
  });
  segmentIdGroup.forEach((id: string) => {
    segmentGroup[id].refs.forEach((ref: any) => {
      if (ref.traceId === props.traceId) {
        traverseTree(
          segmentGroup[ref.parentSegmentId],
          ref.parentSpanId,
          ref.parentSegmentId,
          segmentGroup[id]
        );
      }
    });
  });
  for (const i in segmentGroup) {
    if (segmentGroup[i].refs.length === 0) {
      segmentId.value.push(segmentGroup[i]);
    }
  }
  segmentId.value.forEach((i: any) => {
    collapse(i);
  });
}
function collapse(d: Span) {
  if (d.children) {
    let dur = d.endTime - d.startTime;
    d.children.forEach((i: Span) => {
      dur -= i.endTime - i.startTime;
    });
    d.dur = dur < 0 ? 0 : dur;
    d.children.forEach((i: Span) => collapse(i));
  }
}
onBeforeUnmount(() => {
  d3.selectAll(".d3-tip").remove();
  window.removeEventListener("resize", resize);
});
watch(
  () => props.data,
  () => {
    if (!props.data.length) {
      return;
    }
    loading.value = true;
    changeTree();
    tree.value.init(
      { label: "TRACE_ROOT", children: segmentId.value },
      props.data,
      fixSpansSize.value
    );
    tree.value.draw(() => {
      setTimeout(() => {
        loading.value = false;
      }, 200);
    });
  }
);
</script>
<style lang="scss" scoped>
.d3-graph {
  height: 100%;
}

.trace-node .group {
  cursor: pointer;
  fill-opacity: 0;
}

.trace-node-container {
  fill: rgba(0, 0, 0, 0);
  stroke-width: 5px;
  cursor: pointer;

  &:hover {
    fill: rgba(0, 0, 0, 0.05);
  }
}

.trace-node .node-text {
  font: 12.5px sans-serif;
  pointer-events: none;
}

.domain {
  display: none;
}

.time-charts-item {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid;
  font-size: 11px;
  border-radius: 4px;
}

.trace-list .trace-node rect {
  cursor: pointer;

  &:hover {
    fill: rgba(0, 0, 0, 0.05);
  }
}

.dialog-c-text {
  white-space: pre;
  overflow: auto;
  font-family: monospace;
}
</style>
