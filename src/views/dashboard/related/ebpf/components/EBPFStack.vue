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
  <div id="graph-stack" ref="graph">
    <span class="tip" v-show="ebpfStore.ebpfTips">{{ ebpfStore.ebpfTips }}</span>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import * as d3 from "d3";
  import d3tip from "d3-tip";
  import { flamegraph } from "d3-flame-graph";
  import { useEbpfStore } from "@/store/modules/ebpf";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import { ComponentType } from "@/views/dashboard/related/continuous-profiling/data";
  import type { StackElement } from "@/types/ebpf";
  import { AggregateTypes } from "./data";
  import "d3-flame-graph/dist/d3-flamegraph.css";

  /*global Nullable, defineProps*/
  const props = defineProps({
    type: {
      type: String,
      default: "",
    },
  });
  const ebpfStore = props.type === ComponentType ? useContinousProfilingStore() : useEbpfStore();
  const stackTree = ref<Nullable<StackElement>>(null);
  const selectStack = ref<Nullable<StackElement>>(null);
  const graph = ref<Nullable<HTMLDivElement>>(null);
  const flameChart = ref<any>(null);
  const min = ref<number>(1);
  const max = ref<number>(1);

  function drawGraph() {
    if (flameChart.value) {
      flameChart.value.destroy();
    }
    if (!ebpfStore.analyzeTrees.length) {
      return (stackTree.value = null);
    }
    const root: StackElement = {
      parentId: "0",
      originId: "1",
      name: "Virtual Root",
      children: [],
      value: 0,
      id: "1",
      symbol: "Virtual Root",
      dumpCount: 0,
      stackType: "",
      rateOfRoot: "",
      rateOfParent: "",
    };
    countRange();
    for (const tree of ebpfStore.analyzeTrees) {
      const ele = processTree(tree.elements);
      root.children && root.children.push(ele);
    }
    const param = (root.children || []).reduce(
      (prev: number[], curr: StackElement) => {
        prev[0] += curr.value;
        prev[1] += curr.dumpCount;
        return prev;
      },
      [0, 0],
    );
    root.value = param[0];
    root.dumpCount = param[1];
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
      .onClick((d: { data: StackElement }) => {
        selectStack.value = d.data;
      })
      .setColorMapper((d, originalColor) => (d.highlight ? "#6aff8f" : originalColor));
    const tip = (d3tip as any)()
      .attr("class", "d3-tip")
      .direction("s")
      .html((d: { data: StackElement } & { parent: { data: StackElement } }) => {
        const name = d.data.name.replace("<", "&lt;").replace(">", "&gt;");
        const valStr =
          ebpfStore.aggregateType === AggregateTypes[0].value
            ? `<div class="mb-5">Dump Count: ${d.data.dumpCount}</div>`
            : `<div class="mb-5">Duration: ${d.data.dumpCount} ns</div>`;
        const rateOfParent =
          (d.parent &&
            `<div class="mb-5">Percentage Of Selected: ${
              (
                (d.data.dumpCount / ((selectStack.value && selectStack.value.dumpCount) || root.dumpCount)) *
                100
              ).toFixed(3) + "%"
            }</div>`) ||
          "";
        const rateOfRoot = `<div class="mb-5">Percentage Of Root: ${
          ((d.data.dumpCount / root.dumpCount) * 100).toFixed(3) + "%"
        }</div>`;
        return `<div class="mb-5 name">Symbol: ${name}</div>${valStr}${rateOfParent}${rateOfRoot}`;
      })
      .style("max-width", "400px");
    flameChart.value.tooltip(tip);
    d3.select("#graph-stack").datum(stackTree.value).call(flameChart.value);
  }

  function countRange() {
    const list = [];
    for (const tree of ebpfStore.analyzeTrees) {
      for (const ele of tree.elements) {
        list.push(ele.dumpCount);
      }
    }
    max.value = Math.max(...list);
    min.value = Math.min(...list);
  }

  function processTree(arr: StackElement[]) {
    const copyArr = JSON.parse(JSON.stringify(arr));
    const obj: any = {};
    let res = null;
    for (const item of copyArr) {
      item.parentId = String(Number(item.parentId) + 1);
      item.originId = String(Number(item.id) + 1);
      item.name = item.symbol;
      delete item.id;
      obj[item.originId] = item;
    }
    const scale = d3.scaleLinear().domain([min.value, max.value]).range([1, 200]);

    for (const item of copyArr) {
      if (item.parentId === "1") {
        const val = Number(scale(item.dumpCount).toFixed(4));
        res = item;
        res.value = val;
      }
      for (const key in obj) {
        if (item.originId === obj[key].parentId) {
          const val = Number(scale(obj[key].dumpCount).toFixed(4));

          obj[key].value = val;
          if (item.children) {
            item.children.push(obj[key]);
          } else {
            item.children = [obj[key]];
          }
        }
      }
    }
    treeForeach([res], (node: StackElement) => {
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

  function treeForeach(tree: StackElement[], func: (node: StackElement) => void) {
    for (const data of tree) {
      data.children && treeForeach(data.children, func);
      func(data);
    }
    return tree;
  }

  watch(
    () => ebpfStore.analyzeTrees,
    () => {
      drawGraph();
    },
  );
</script>
<style>
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
