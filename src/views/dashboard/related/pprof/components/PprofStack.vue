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
  <div ref="graph"></div>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import * as d3 from "d3";
  import d3tip from "d3-tip";
  import { flamegraph } from "d3-flame-graph";
  import { usePprofStore } from "@/store/modules/pprof";
  import type { PprofStackElement, PprofFlameGraphNode } from "@/types/pprof";
  import "d3-flame-graph/dist/d3-flamegraph.css";
  import { treeForeach } from "@/utils/flameGraph";

  /*global Nullable*/
  const pprofStore = usePprofStore();
  const stackTree = ref<Nullable<PprofFlameGraphNode>>(null);
  const selectStack = ref<Nullable<PprofFlameGraphNode>>(null);
  const graph = ref<Nullable<HTMLDivElement>>(null);
  const flameChart = ref<any>(null);
  const min = ref<number>(1);
  const max = ref<number>(1);

  function drawGraph() {
    if (flameChart.value) {
      flameChart.value.destroy();
    }
    if (!pprofStore.analyzeTrees.length || !graph.value) {
      stackTree.value = null;
      return;
    }
    const root: PprofFlameGraphNode = {
      parentId: "0",
      originId: "1",
      name: "Virtual Root",
      children: [],
      value: 0,
      id: "1",
      symbol: "Virtual Root",
      dumpCount: 0,
      self: 0,
    };
    countRange();
    const elements = processTree((pprofStore.analyzeTrees[0].elements || []) as PprofStackElement[]);
    if (!elements) {
      stackTree.value = null;
      return;
    }
    stackTree.value = elements;
    const treeRoot = { ...root, ...elements };
    const width = graph.value.getBoundingClientRect().width || 0;
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
      .onClick((d: { data: PprofFlameGraphNode }) => {
        selectStack.value = d.data;
      })
      .setColorMapper((d, originalColor) => (d.highlight ? "#6aff8f" : originalColor));
    const tip = (d3tip as any)()
      .attr("class", "d3-tip")
      .direction("s")
      .html((d: { data: PprofFlameGraphNode } & { parent: { data: PprofFlameGraphNode } }) => {
        const name = d.data.name.replace("<", "&lt;").replace(">", "&gt;");
        const rateOfParent =
          (d.parent &&
            `<div class="mb-5">Percentage Of Selected: ${
              (
                (d.data.dumpCount / ((selectStack.value && selectStack.value.dumpCount) || treeRoot.dumpCount)) *
                100
              ).toFixed(3) + "%"
            }</div>`) ||
          "";
        const rateOfRoot = `<div class="mb-5">Percentage Of Root: ${
          ((d.data.dumpCount / treeRoot.dumpCount) * 100).toFixed(3) + "%"
        }</div>`;
        return `<div class="mb-5 name">Symbol: ${name}</div>
          <div class="mb-5">Total: ${d.data.dumpCount}</div>
          <div class="mb-5">Self: ${d.data.self}</div>
          ${rateOfParent}${rateOfRoot}`;
      })
      .style("max-width", "400px");
    flameChart.value.tooltip(tip);
    d3.select(graph.value).datum(treeRoot).call(flameChart.value);
  }

  function countRange() {
    const list = (pprofStore.analyzeTrees[0]?.elements || []).map((ele: PprofStackElement) => ele.dumpCount);
    max.value = Math.max(...(list.length ? list : [1]));
    min.value = Math.min(...(list.length ? list : [1]));
  }

  function processTree(arr: PprofStackElement[]): Nullable<PprofFlameGraphNode> {
    const copyArr = JSON.parse(JSON.stringify(arr));
    const obj: Record<string, PprofFlameGraphNode> = {};
    let res = null as Nullable<PprofFlameGraphNode>;
    for (const item of copyArr) {
      item.parentId = String(Number(item.parentId) + 1);
      item.originId = String(Number(item.id) + 1);
      item.name = item.symbol;
      delete item.id;
      obj[item.originId] = item;
    }
    const scale = d3.scaleLinear().domain([min.value, max.value]).range([1, 200]);
    for (const item of copyArr) {
      if (item.parentId === "0") {
        const val = Number(scale(item.dumpCount).toFixed(4));
        item.value = val;
        res = item as PprofFlameGraphNode;
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
    if (!res) {
      return null;
    }
    treeForeach([res], (node: PprofFlameGraphNode) => {
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
    () => pprofStore.analyzeTrees,
    () => {
      drawGraph();
    },
  );
</script>
