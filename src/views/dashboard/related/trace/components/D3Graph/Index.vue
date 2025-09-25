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
  import ListGraph from "./utils/d3-trace-list";
  import TreeGraph from "./utils/d3-trace-tree";
  import type { Span, Ref } from "@/types/trace";
  import SpanDetail from "./SpanDetail.vue";
  import TableContainer from "../Table/TableContainer.vue";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { debounce } from "@/utils/debounce";
  import { mutationObserver } from "@/utils/mutation";
  import { TraceGraphType } from "../VisGraph/constant";
  import { Themes } from "@/constants/data";
  import type { SegmentSpan } from "@/types/profile";
  import { buildSegmentForest, collapseTree, getRefsAllNodes } from "./utils/helper";

  /* global Recordable, Nullable */
  const props = defineProps({
    data: { type: Array as PropType<(Span | SegmentSpan)[]>, default: () => [] },
    traceId: { type: String, default: "" },
    type: { type: String, default: TraceGraphType.LIST },
    headerType: { type: String, default: "" },
  });
  const emits = defineEmits(["select"]);
  const appStore = useAppStoreWithOut();
  const loading = ref<boolean>(false);
  const showDetail = ref<boolean>(false);
  const fixSpansSize = ref<number>(0);
  const segmentId = ref<Recordable[]>([]);
  const currentSpan = ref<Nullable<Span>>(null);
  const refSpans = ref<Array<Ref>>([]);
  const tree = ref<Nullable<any>>(null);
  const traceGraph = ref<Nullable<HTMLDivElement>>(null);
  const parentSpans = ref<Array<Span | SegmentSpan>>([]);
  const refParentSpans = ref<Array<Span | SegmentSpan>>([]);
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
      emits("select", i);
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
  function changeTree() {
    if (!props.data.length) {
      return [];
    }
    const { roots, fixSpansSize: fixSize, refSpans: refs } = buildSegmentForest(props.data as Span[], props.traceId);
    segmentId.value = roots as unknown as Recordable[];
    fixSpansSize.value = fixSize;
    refSpans.value = refs;
    for (const root of segmentId.value) {
      collapseTree(root as unknown as Span, refSpans.value);
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
