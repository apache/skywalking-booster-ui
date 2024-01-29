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
  <el-dialog v-model="showDetail" :destroy-on-close="true" fullscreen @closed="showDetail = false">
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
  import type { Span, Ref } from "@/types/trace";
  import SpanDetail from "./SpanDetail.vue";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { debounce } from "@/utils/debounce";

  /* global defineProps, Nullable, defineExpose,Recordable*/
  const props = defineProps({
    data: { type: Array as PropType<Span[]>, default: () => [] },
    traceId: { type: String, default: "" },
    type: { type: String, default: "List" },
  });
  const appStore = useAppStoreWithOut();
  const loading = ref<boolean>(false);
  const showDetail = ref<boolean>(false);
  const fixSpansSize = ref<number>(0);
  const segmentId = ref<Recordable[]>([]);
  const currentSpan = ref<Array<Span>>([]);
  const refSpans = ref<Array<Ref>>([]);
  const tree = ref<Nullable<any>>(null);
  const traceGraph = ref<Nullable<HTMLDivElement>>(null);
  const debounceFunc = debounce(draw, 500);

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
    draw();
    loading.value = false;
    window.addEventListener("resize", debounceFunc);
  });

  function draw() {
    if (!traceGraph.value) {
      return;
    }
    if (props.type === "List") {
      tree.value = new ListGraph(traceGraph.value, handleSelectSpan);
      tree.value.init({ label: "TRACE_ROOT", children: segmentId.value }, props.data, fixSpansSize.value);
      tree.value.draw();
    } else {
      tree.value = new TreeGraph(traceGraph.value, handleSelectSpan);
      tree.value.init({ label: `${props.traceId}`, children: segmentId.value }, props.data);
    }
  }
  function handleSelectSpan(i: Recordable) {
    currentSpan.value = i.data;
    showDetail.value = true;
  }
  function traverseTree(node: Recordable, spanId: string, segmentId: string, data: Recordable) {
    if (!node || node.isBroken) {
      return;
    }
    if (node.spanId === spanId && node.segmentId === segmentId) {
      node.children.push(data);
      return;
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach((nodeItem: Recordable) => {
        traverseTree(nodeItem, spanId, segmentId, data);
      });
    }
  }
  function changeTree() {
    if (props.data.length === 0) {
      return [];
    }
    segmentId.value = [];
    const segmentGroup: Recordable = {};
    const segmentIdGroup: Recordable = [];
    const fixSpans: Span[] = [];
    const segmentHeaders: Span[] = [];
    for (const span of props.data) {
      if (span.refs.length) {
        refSpans.value.push(...span.refs);
      }
      if (span.parentSpanId === -1) {
        segmentHeaders.push(span);
      } else {
        const item = props.data.find((i: Span) => i.segmentId === span.segmentId && i.spanId === span.spanId - 1);
        const fixSpanKeyContent = {
          traceId: span.traceId,
          segmentId: span.segmentId,
          spanId: span.spanId - 1,
          parentSpanId: span.spanId - 2,
        };
        if (!item && !_.find(fixSpans, fixSpanKeyContent)) {
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
            startTime: 0,
            endTime: 0,
          });
        }
      }
    }
    segmentHeaders.forEach((span: Span) => {
      if (span.refs.length) {
        let exit = 0;
        span.refs.forEach((ref) => {
          const i = props.data.findIndex(
            (i: Recordable) => ref.parentSegmentId === i.segmentId && ref.parentSpanId === i.spanId,
          );
          if (i > -1) {
            exit = 1;
          }
        });

        if (!exit) {
          const ref = span.refs[0];
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
              startTime: 0,
              endTime: 0,
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
                startTime: 0,
                endTime: 0,
              });
            }
          }
        }
      }
    });
    [...fixSpans, ...props.data].forEach((i) => {
      i.label = i.endpointName || "no operation name";
      i.children = [];
      if (!segmentGroup[i.segmentId]) {
        segmentIdGroup.push(i.segmentId);
        segmentGroup[i.segmentId] = [i];
      } else {
        segmentGroup[i.segmentId].push(i);
      }
    });
    fixSpansSize.value = fixSpans.length;
    segmentIdGroup.forEach((id: string) => {
      const currentSegment = segmentGroup[id].sort((a: Span, b: Span) => b.parentSpanId - a.parentSpanId);
      currentSegment.forEach((s: Recordable) => {
        const index = currentSegment.findIndex((i: Span) => i.spanId === s.parentSpanId);
        if (index !== -1) {
          if (
            (currentSegment[index].isBroken && currentSegment[index].parentSpanId === -1) ||
            !currentSegment[index].isBroken
          ) {
            currentSegment[index].children.push(s);
            currentSegment[index].children.sort((a: Span, b: Span) => a.spanId - b.spanId);
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
      segmentGroup[id].refs.forEach((ref: Recordable) => {
        if (ref.traceId === props.traceId) {
          traverseTree(segmentGroup[ref.parentSegmentId], ref.parentSpanId, ref.parentSegmentId, segmentGroup[id]);
        }
      });
    });
    for (const i in segmentGroup) {
      if (segmentGroup[i].refs.length === 0) {
        segmentId.value.push(segmentGroup[i]);
      }
    }
    segmentId.value.forEach((i: Span | Recordable) => {
      collapse(i);
    });
  }
  function collapse(d: Span | Recordable) {
    if (d.children) {
      const item = refSpans.value.find((s: Ref) => s.parentSpanId === d.spanId && s.parentSegmentId === d.segmentId);
      let dur = d.endTime - d.startTime;
      d.children.forEach((i: Span) => {
        dur -= i.endTime - i.startTime;
      });
      d.dur = dur < 0 ? 0 : dur;
      if (item) {
        d.children = d.children.sort(compare("startTime"));
      }
      d.children.forEach((i: Span) => collapse(i));
    }
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
  });
  watch(
    () => props.data,
    () => {
      if (!props.data.length) {
        return;
      }
      loading.value = true;
      changeTree();
      tree.value.init({ label: "TRACE_ROOT", children: segmentId.value }, props.data, fixSpansSize.value);
      tree.value.draw(() => {
        setTimeout(() => {
          loading.value = false;
        }, 200);
      });
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
<style lang="scss" scoped>
  .d3-graph {
    height: 100%;
  }

  .trace-node .group {
    cursor: pointer;
    fill-opacity: 0;
  }

  .trace-node-container {
    fill: rgb(0 0 0 / 0%);
    stroke-width: 5px;
    cursor: pointer;

    &:hover {
      fill: rgb(0 0 0 / 5%);
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

  .dialog-c-text {
    white-space: pre;
    overflow: auto;
    font-family: monospace;
  }
</style>
