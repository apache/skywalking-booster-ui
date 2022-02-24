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
  <div class="time-charts scroll_hide">
    <div class="trace-t-loading" v-show="loading">
      <Icon iconName="spinner" size="sm" />
    </div>
    <transition-group name="fade" tag="a" class="mb-5">
      <span
        class="time-charts-item mr-10"
        v-for="(i, index) in data"
        :key="index"
        :style="`color:${computedScale(index)}`"
      >
        <svg class="icon vm mr-5 sm">
          <use xlink:href="#issue-open-m"></use>
        </svg>
        <span>{{ i }}</span>
      </span>
    </transition-group>
    <a class="rk-btn r vm tc" @click="downloadTrace">{{ t("exportImage") }}</a>
    <div class="trace-list">
      <div ref="traceList"></div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch, onBeforeUnmount, onMounted } from "vue";
import type { PropType } from "vue";
import _ from "lodash";
import { useI18n } from "vue-i18n";
import * as d3 from "d3";
import ListGraph from "./utils/d3-trace";
import copy from "@/utils/copy";
import { Span, Trace } from "@/types/trace";
import { Option } from "@/types/app";
/* global defineProps, Nullable*/
const props = defineProps({
  data: { type: Array as PropType<Span[]>, default: () => [] },
  traceId: { type: String, default: "" },
});
const { t } = useI18n();
const loading = ref<boolean>(false);
const showDetail = ref<boolean>(false);
const fixSpansSize = ref<number>(0);
const segmentId = ref<any>([]);
const currentSpan = ref<Array<Span>>([]);
const list = ref<any>([]);
const tree = ref<any>(null);
const traceList = ref<Nullable<HTMLDivElement>>(null);

onMounted(() => {
  loading.value = true;
  changeTree();
  if (!traceList.value) {
    loading.value = false;
    return;
  }
  tree.value = new ListGraph(traceList.value, handleSelectSpan);
  tree.value.init(
    { label: "TRACE_ROOT", children: segmentId.value },
    props.data,
    fixSpansSize.value
  );
  tree.value.draw();
  loading.value = false;
});
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
function computedScale(i: any) {
  // Rainbow map
  const sequentialScale = d3
    .scaleSequential()
    .domain([0, list.value.length + 1])
    .interpolator(d3.interpolateCool);
  return sequentialScale(i);
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
function downloadTrace() {
  const serializer = new XMLSerializer();
  const svgNode: any = d3.select(".trace-list-dowanload").node();
  const source = `<?xml version="1.0" standalone="no"?>\r\n${serializer.serializeToString(
    svgNode
  )}`;
  const canvas = document.createElement("canvas");
  const context: any = canvas.getContext("2d");
  canvas.width = (
    d3.select(".trace-list-dowanload") as any
  )._groups[0][0].clientWidth;
  canvas.height = (
    d3.select(".trace-list-dowanload") as any
  )._groups[0][0].clientHeight;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  image.onload = () => {
    context.drawImage(image, 0, 0);
    const tagA = document.createElement("a");
    tagA.download = "trace-list.png";
    tagA.href = canvas.toDataURL("image/png");
    tagA.click();
  };
}
function changeTree() {
  if (props.data.length === 0) {
    return [];
  }
  list.value = Array.from(new Set(props.data.map((i: any) => i.serviceCode)));
  segmentId.value = [];
  const segmentGroup: any = {};
  const segmentIdGroup: any = [];
  const fixSpans: any = [];
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
onBeforeUnmount(() => {
  d3.selectAll(".d3-tip").remove();
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
.time-charts {
  overflow: auto;
  padding: 10px 30px;
  position: relative;
  min-height: 150px;
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

.trace-list {
  fill: rgba(0, 0, 0, 0);
}

.trace-list .trace-node rect {
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
