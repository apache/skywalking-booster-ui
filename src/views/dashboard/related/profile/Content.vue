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
  <div class="flex-h content">
    <div class="list">
      <TaskList />
      <SegmentList />
    </div>
    <div class="item">
      <SpanTree @loading="loadTrees" @displayMode="setDisplayMode" />
      <div class="thread-stack">
        <div id="graph-stack" ref="graph" v-show="displayMode === 'flame'" />
        <StackTable
          v-show="displayMode === 'tree'"
          v-if="profileStore.analyzeTrees.length"
          :data="profileStore.analyzeTrees"
          :highlightTop="profileStore.highlightTop"
        />
        <div class="t-loading" v-show="loading">
          <Icon :loading="true" iconName="spinner" size="middle" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  /*global Nullable*/
  import { ref, watch } from "vue";
  import TaskList from "./components/TaskList.vue";
  import SegmentList from "./components/SegmentList.vue";
  import SpanTree from "./components/SpanTree.vue";
  import StackTable from "./components/Stack/Index.vue";
  import { useProfileStore } from "@/store/modules/profile";
  import type { TraceProfilingElement } from "@/types/ebpf";
  import { flamegraph } from "d3-flame-graph";
  import * as d3 from "d3";
  import d3tip from "d3-tip";
  import { treeForeach } from "@/utils/flameGraph";
  const stackTree = ref<Nullable<TraceProfilingElement>>(null);
  const selectStack = ref<Nullable<TraceProfilingElement>>(null);
  const graph = ref<Nullable<HTMLDivElement>>(null);
  const flameChart = ref<any>(null);
  const min = ref<number>(1);
  const max = ref<number>(1);
  const loading = ref<boolean>(false);
  const displayMode = ref<string>("tree");
  const profileStore = useProfileStore();

  function loadTrees(l: boolean) {
    loading.value = l;
  }
  function setDisplayMode(mode: string) {
    displayMode.value = mode;
  }

  function drawGraph() {
    if (flameChart.value) {
      flameChart.value.destroy();
    }
    if (!profileStore.analyzeTrees.length) {
      return (stackTree.value = null);
    }
    const root: TraceProfilingElement = {
      parentId: "0",
      originId: "1",
      name: "Virtual Root",
      children: [],
      value: 0,
      id: "1",
      codeSignature: "Virtual Root",
      count: 0,
      stackType: "",
      rateOfRoot: "",
      rateOfParent: "",
      duration: 0,
      durationChildExcluded: 0,
    };
    countRange();
    for (const tree of profileStore.analyzeTrees) {
      const ele = processTree(tree.elements);
      root.children && root.children.push(ele);
    }
    const param = (root.children || []).reduce(
      (prev: number[], curr: TraceProfilingElement) => {
        prev[0] += curr.value;
        prev[1] += curr.count;
        return prev;
      },
      [0, 0],
    );
    root.value = param[0];
    root.count = param[1];
    stackTree.value = root;
    const width = (graph.value && graph.value.getBoundingClientRect().width) || 0;
    const w = width < 800 ? 802 : width;
    flameChart.value = flamegraph()
      .width(w - 15)
      .cellHeight(18)
      .transitionDuration(750)
      .minFrameSize(1)
      .transitionEase(d3.easeCubic as any)
      .sort(true)
      .title("")
      .selfValue(false)
      .inverted(true)
      .onClick((d: { data: TraceProfilingElement }) => {
        selectStack.value = d.data;
      })
      .setColorMapper((d, originalColor) => (d.highlight ? "#6aff8f" : originalColor));
    const tip = (d3tip as any)()
      .attr("class", "d3-tip")
      .direction("s")
      .html((d: { data: TraceProfilingElement } & { parent: { data: TraceProfilingElement } }) => {
        const name = d.data.name.replace("<", "&lt;").replace(">", "&gt;");
        const dumpCount = `<div class="mb-5">Dump Count: ${d.data.count}</div>`;
        const duration = `<div class="mb-5">Duration: ${d.data.duration} ns</div>`;
        const durationChildExcluded = `<div class="mb-5">DurationChildExcluded: ${d.data.durationChildExcluded} ns</div>`;
        const rateOfParent =
          (d.parent &&
            `<div class="mb-5">Percentage Of Selected: ${
              ((d.data.count / ((selectStack.value && selectStack.value.count) || root.count)) * 100).toFixed(3) + "%"
            }</div>`) ||
          "";
        const rateOfRoot = `<div class="mb-5">Percentage Of Root: ${
          ((d.data.count / root.count) * 100).toFixed(3) + "%"
        }</div>`;
        return `<div class="mb-5 name">CodeSignature: ${name}</div>${dumpCount}${duration}${durationChildExcluded}${rateOfParent}${rateOfRoot}`;
      })
      .style("max-width", "400px");
    flameChart.value.tooltip(tip);
    d3.select("#graph-stack").datum(stackTree.value).call(flameChart.value);
  }

  function countRange() {
    const list = [];
    for (const tree of profileStore.analyzeTrees) {
      for (const ele of tree.elements) {
        list.push(ele.count);
      }
    }
    max.value = Math.max(...list);
    min.value = Math.min(...list);
  }

  function processTree(arr: TraceProfilingElement[]) {
    const copyArr = JSON.parse(JSON.stringify(arr));
    const obj: any = {};
    let res = null;
    for (const item of copyArr) {
      item.parentId = String(Number(item.parentId) + 1);
      item.originId = String(Number(item.id) + 1);
      item.name = item.codeSignature;
      delete item.id;
      obj[item.originId] = item;
    }
    const scale = d3.scaleLinear().domain([min.value, max.value]).range([1, 200]);

    for (const item of copyArr) {
      if (item.parentId === "1") {
        const val = Number(scale(item.count).toFixed(4));
        res = item;
        res.value = val;
      }
      for (const key in obj) {
        if (item.originId === obj[key].parentId) {
          const val = Number(scale(obj[key].count).toFixed(4));

          obj[key].value = val;
          if (item.children) {
            item.children.push(obj[key]);
          } else {
            item.children = [obj[key]];
          }
        }
      }
    }
    treeForeach([res], (node: TraceProfilingElement) => {
      if (node.children) {
        let val = 0;
        for (const child of node.children) {
          val = child.value + val;
        }
        node.value = node.value < val ? val : node.value;
      }
    });

    return res;
  }

  watch(
    () => profileStore.analyzeTrees,
    () => {
      drawGraph();
    },
  );
</script>
<style lang="scss" scoped>
  .content {
    height: calc(100% - 30px);
    width: 100%;
  }

  .item {
    height: 100%;
    flex-grow: 2;
    overflow: auto;
  }

  .list {
    width: 300px;
    height: 100%;
  }

  .thread-stack {
    padding: 5px;
    height: calc(50% - 20px);
    overflow: auto;
    width: 100%;
  }

  .t-loading {
    text-align: center;
    width: 100%;
    overflow: hidden;
    height: calc(50% - 20px);
  }

  #graph-stack {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .tip {
    display: inline-block;
    width: 100%;
    text-align: center;
    color: red;
    margin-top: 20px;
  }

  .name {
    word-wrap: break-word;
  }
</style>
