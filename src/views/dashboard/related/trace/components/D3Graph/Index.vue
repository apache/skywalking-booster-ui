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
  <TableContainer
    v-if="type === TraceGraphType.TABLE"
    :tableData="segmentId"
    :type="type"
    :headerType="headerType"
    :traceId="traceId"
    @select="handleSelectSpan"
  >
    <div class="trace-tips" v-if="!segmentId.length">{{ $t("noData") }}</div>
  </TableContainer>
  <div v-else ref="traceGraph" class="d3-graph"></div>
  <div id="trace-action-box">
    <div @click="viewSpanDetails">Span details</div>
    <div v-for="span in parentSpans" :key="span.segmentId" @click="viewParentSpan(span)">
      {{ `Parent span: ${span.endpointName} -> Start time: ${visDate(span.startTime)}` }}
    </div>
    <div v-for="span in refParentSpans" :key="span.segmentId" @click="viewParentSpan(span)">
      {{ `Ref to span: ${span.endpointName} -> Start time: ${visDate(span.startTime)}` }}
    </div>
  </div>
  <el-dialog
    v-model="showDetail"
    width="60%"
    center
    align-center
    :destroy-on-close="true"
    @closed="showDetail = false"
    v-if="currentSpan?.segmentId"
  >
    <SpanDetail :currentSpan="currentSpan" />
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref, watch, onBeforeUnmount, onMounted } from "vue";
  import type { PropType } from "vue";
  import * as d3 from "d3";
  import dayjs from "dayjs";
  import ListGraph from "../../utils/d3-trace-list";
  import TreeGraph from "../../utils/d3-trace-tree";
  import type { Span, Ref } from "@/types/trace";
  import SpanDetail from "./SpanDetail.vue";
  import TableContainer from "../Table/TableContainer.vue";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { debounce } from "@/utils/debounce";
  import { mutationObserver } from "@/utils/mutation";
  import { TraceGraphType } from "../constant";
  import { Themes } from "@/constants/data";

  /* global Recordable, Nullable */
  const props = defineProps({
    data: { type: Array as PropType<Span[]>, default: () => [] },
    traceId: { type: String, default: "" },
    type: { type: String, default: TraceGraphType.LIST },
    headerType: { type: String, default: "" },
  });
  const appStore = useAppStoreWithOut();
  const loading = ref<boolean>(false);
  const showDetail = ref<boolean>(false);
  const fixSpansSize = ref<number>(0);
  const segmentId = ref<Recordable[]>([]);
  const currentSpan = ref<Nullable<Span>>(null);
  const refSpans = ref<Array<Ref>>([]);
  const tree = ref<Nullable<any>>(null);
  const traceGraph = ref<Nullable<HTMLDivElement>>(null);
  const parentSpans = ref<Array<Span>>([]);
  const refParentSpans = ref<Array<Span>>([]);
  const debounceFunc = debounce(draw, 500);
  const visDate = (date: number, pattern = "YYYY-MM-DD HH:mm:ss:SSS") => dayjs(date).format(pattern);

  onMounted(() => {
    loading.value = true;
    changeTree();
    draw();
    loading.value = false;
    // monitor segment list width changes.
    mutationObserver.create("trigger-resize", () => {
      d3.selectAll(".d3-tip").remove();
      debounceFunc();
    });
    window.addEventListener("resize", debounceFunc);
  });

  function draw() {
    if (props.type === TraceGraphType.TABLE) {
      segmentId.value = setLevel(segmentId.value);
      return;
    }
    if (!traceGraph.value) {
      return;
    }
    d3.selectAll(".d3-tip").remove();
    if (props.type === TraceGraphType.LIST) {
      tree.value = new ListGraph(traceGraph.value, handleSelectSpan);
      tree.value.init(
        { label: "TRACE_ROOT", children: segmentId.value },
        getRefsAllNodes({ label: "TRACE_ROOT", children: segmentId.value }),
        fixSpansSize.value,
      );
      tree.value.draw();
      return;
    }
    if (props.type === TraceGraphType.TREE) {
      tree.value = new TreeGraph(traceGraph.value, handleSelectSpan);
      tree.value.init(
        { label: `${props.traceId}`, children: segmentId.value },
        getRefsAllNodes({ label: "TRACE_ROOT", children: segmentId.value }),
      );
    }
  }
  function handleSelectSpan(i: any) {
    const spans = [];
    const refSpans = [];
    parentSpans.value = [];
    refParentSpans.value = [];
    if (props.type === TraceGraphType.TABLE) {
      currentSpan.value = i;
    } else {
      currentSpan.value = i.data;
    }
    if (!currentSpan.value) {
      return;
    }
    for (const ref of currentSpan.value.refs || []) {
      refSpans.push(ref);
    }
    if (currentSpan.value.parentSpanId > -1) {
      spans.push({
        parentSegmentId: currentSpan.value.segmentId,
        parentSpanId: currentSpan.value.parentSpanId,
        traceId: currentSpan.value.traceId,
      });
    }
    for (const span of refSpans) {
      const item = props.data.find(
        (d) => d.segmentId === span.parentSegmentId && d.spanId === span.parentSpanId && d.traceId === span.traceId,
      );
      item && refParentSpans.value.push(item);
    }
    for (const span of spans) {
      const item = props.data.find(
        (d) => d.segmentId === span.parentSegmentId && d.spanId === span.parentSpanId && d.traceId === span.traceId,
      );
      item && parentSpans.value.push(item);
    }
  }
  function viewParentSpan(span: Recordable) {
    if (props.type === TraceGraphType.TABLE) {
      setTableSpanStyle(span);
      return;
    }
    tree.value.highlightParents(span);
  }
  function viewSpanDetails() {
    showDetail.value = true;
    hideActionBox();
  }
  function setTableSpanStyle(span: Recordable) {
    const itemDom: any = document.querySelector(`.trace-item-${span.key}`);
    const items: any = document.querySelectorAll(".trace-item");
    for (const item of items) {
      item.style.background = appStore.theme === Themes.Dark ? "#212224" : "#fff";
    }
    itemDom.style.background = appStore.theme === Themes.Dark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)";
    hideActionBox();
  }
  function hideActionBox() {
    const box: any = document.querySelector("#trace-action-box");
    box.style.display = "none";
  }
  function traverseTree(node: Recordable, spanId: string, segmentId: string, data: Recordable) {
    if (!node || node.isBroken) {
      return;
    }
    if (node.spanId === spanId && node.segmentId === segmentId) {
      node.children.push(data);
      return;
    }
    for (const nodeItem of node.children || []) {
      traverseTree(nodeItem, spanId, segmentId, data);
    }
  }
  function changeTree() {
    if (props.data.length === 0) {
      return [];
    }
    segmentId.value = [];
    const segmentGroup: Recordable = {};
    const segmentIdGroup: string[] = [];
    const fixSpans: Span[] = [];
    const segmentHeaders: Span[] = [];
    for (const span of props.data) {
      if (span.refs.length) {
        refSpans.value.push(...span.refs);
      }
      if (span.parentSpanId === -1) {
        segmentHeaders.push(span);
      } else {
        const item = props.data.find(
          (i: Span) => i.traceId === span.traceId && i.segmentId === span.segmentId && i.spanId === span.spanId - 1,
        );
        const content = fixSpans.find(
          (i: Span) =>
            i.traceId === span.traceId &&
            i.segmentId === span.segmentId &&
            i.spanId === span.spanId - 1 &&
            i.parentSpanId === span.spanId - 2,
        );
        if (!item && !content) {
          fixSpans.push({
            traceId: span.traceId,
            segmentId: span.segmentId,
            spanId: span.spanId - 1,
            parentSpanId: span.spanId - 2,
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
            startTime: 0,
            endTime: 0,
          });
        }
      }
    }
    for (const span of segmentHeaders) {
      if (span.refs.length) {
        let exit = null;
        for (const ref of span.refs) {
          const e = props.data.find(
            (i: Recordable) =>
              ref.traceId === i.traceId && ref.parentSegmentId === i.segmentId && ref.parentSpanId === i.spanId,
          );
          if (e) {
            exit = e;
          }
        }
        if (!exit) {
          const ref = span.refs[0];
          // create a known broken node.
          const parentSpanId = ref.parentSpanId > -1 ? 0 : -1;
          const content = fixSpans.find(
            (i: Span) =>
              i.traceId === ref.traceId &&
              i.segmentId === ref.parentSegmentId &&
              i.spanId === ref.parentSpanId &&
              i.parentSpanId === parentSpanId,
          );
          if (!content) {
            fixSpans.push({
              traceId: ref.traceId,
              segmentId: ref.parentSegmentId,
              spanId: ref.parentSpanId,
              parentSpanId,
              refs: [],
              endpointName: `VNode: ${ref.parentSegmentId}`,
              serviceCode: "VirtualNode",
              type: `[Broken] ${ref.type}`,
              peer: "",
              component: `VirtualNode: #${ref.parentSpanId}`,
              isError: true,
              isBroken: true,
              layer: "Broken",
              tags: [],
              logs: [],
              startTime: 0,
              endTime: 0,
            });
          }
          // if root broken node is not exist, create a root broken node.
          if (parentSpanId > -1) {
            const content = fixSpans.find(
              (i: Span) =>
                i.traceId === ref.traceId &&
                i.segmentId === ref.parentSegmentId &&
                i.spanId === 0 &&
                i.parentSpanId === -1,
            );
            if (!content) {
              fixSpans.push({
                traceId: ref.traceId,
                segmentId: ref.parentSegmentId,
                spanId: 0,
                parentSpanId: -1,
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
                startTime: 0,
                endTime: 0,
              });
            }
          }
        }
      }
    }
    for (const i of [...fixSpans, ...props.data]) {
      i.label = i.endpointName || "no operation name";
      i.key = Math.random().toString(36).substring(2, 36);
      i.children = [];
      if (segmentGroup[i.segmentId]) {
        segmentGroup[i.segmentId].push(i);
      } else {
        segmentIdGroup.push(i.segmentId);
        segmentGroup[i.segmentId] = [i];
      }
    }
    fixSpansSize.value = fixSpans.length;
    for (const id of segmentIdGroup) {
      const currentSegment = segmentGroup[id].sort((a: Span, b: Span) => b.parentSpanId - a.parentSpanId);
      for (const s of currentSegment) {
        const index = currentSegment.findIndex((i: Span) => i.spanId === s.parentSpanId);
        if (index > -1) {
          if (
            (currentSegment[index].isBroken && currentSegment[index].parentSpanId === -1) ||
            !currentSegment[index].isBroken
          ) {
            currentSegment[index].children.push(s);
            currentSegment[index].children.sort((a: Span, b: Span) => a.spanId - b.spanId);
          }
        }
        if (s.isBroken) {
          const children = props.data.filter((span: Span) =>
            span.refs.find(
              (d) => d.traceId === s.traceId && d.parentSegmentId === s.segmentId && d.parentSpanId === s.spanId,
            ),
          );
          if (children.length) {
            s.children.push(...children);
          }
        }
      }
      segmentGroup[id] = currentSegment[currentSegment.length - 1];
    }
    for (const id of segmentIdGroup) {
      for (const ref of segmentGroup[id].refs) {
        if (ref.traceId === props.traceId) {
          traverseTree(segmentGroup[ref.parentSegmentId], ref.parentSpanId, ref.parentSegmentId, segmentGroup[id]);
        }
      }
    }
    for (const i in segmentGroup) {
      for (const ref of segmentGroup[i].refs) {
        if (!segmentGroup[ref.parentSegmentId]) {
          segmentId.value.push(segmentGroup[i]);
        }
      }
      if (!segmentGroup[i].refs.length && segmentGroup[i].parentSpanId === -1) {
        segmentId.value.push(segmentGroup[i]);
      }
    }
    for (const i of segmentId.value) {
      collapse(i);
    }
  }
  function collapse(d: Span | Recordable) {
    if (d.children) {
      const item = refSpans.value.find((s: Ref) => s.parentSpanId === d.spanId && s.parentSegmentId === d.segmentId);
      let dur = d.endTime - d.startTime;
      for (const i of d.children) {
        dur -= i.endTime - i.startTime;
      }
      d.dur = dur < 0 ? 0 : dur;
      if (item) {
        d.children = d.children.sort(compare("startTime"));
      }
      for (const i of d.children) {
        collapse(i);
      }
    }
  }
  function setLevel(arr: Recordable[], level = 1, totalExec?: number) {
    for (const item of arr) {
      item.level = level;
      totalExec = totalExec || item.endTime - item.startTime;
      item.totalExec = totalExec;
      if (item.children && item.children.length > 0) {
        setLevel(item.children, level + 1, totalExec);
      }
    }
    return arr;
  }
  function getRefsAllNodes(tree: Recordable) {
    let nodes = [];
    let stack = [tree];

    while (stack.length > 0) {
      const node = stack.pop();
      nodes.push(node);

      if (node?.children && node.children.length > 0) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i]);
        }
      }
    }

    return nodes;
  }
  function compare(p: string) {
    return (m: Recordable, n: Recordable) => {
      const a = m[p];
      const b = n[p];
      return a - b;
    };
  }
  onBeforeUnmount(() => {
    d3.selectAll(".d3-tip").remove();
    window.removeEventListener("resize", debounceFunc);
    mutationObserver.deleteObserve("trigger-resize");
  });
  watch(
    () => props.data,
    () => {
      if (!props.data.length) {
        return;
      }
      loading.value = true;
      changeTree();
      draw();
      loading.value = false;
    },
  );
  watch(
    () => appStore.theme,
    () => {
      tree.value.init({ label: "TRACE_ROOT", children: segmentId.value }, props.data, fixSpansSize.value);
      tree.value.draw(() => {
        setTimeout(() => {
          loading.value = false;
        }, 200);
      });
    },
  );
</script>
<style lang="scss">
  .d3-graph {
    height: 100%;
  }

  .trace-node .group {
    cursor: pointer;
    fill-opacity: 0;
  }

  .trace-node .node-text {
    font: 12px sans-serif;
    pointer-events: none;
  }

  .trace-node.highlighted .node-text,
  .trace-node.highlightedParent .node-text {
    font-weight: bold;
    fill: #409eff;
  }

  .highlightedParent .node,
  .highlighted .node {
    stroke-width: 4;
    fill: var(--font-color);
    stroke: var(--font-color);
  }

  .trace-node.highlighted .trace-node-text,
  .trace-node.highlightedParent .trace-node-text {
    font-weight: bold;
    fill: #409eff;
  }

  #trace-action-box {
    position: absolute;
    color: $font-color;
    cursor: pointer;
    border: var(--sw-topology-border);
    border-radius: 3px;
    background-color: $theme-background;
    padding: 10px 0;
    display: none;

    div {
      height: 30px;
      line-height: 30px;
      text-align: left;
      padding: 0 15px;
    }

    div:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }
  }
</style>
