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
    <span class="tip" v-show="ebpfStore.tip">{{ ebpfStore.tip }}</span>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import * as d3 from "d3";
import d3tip from "d3-tip";
import { flamegraph } from "d3-flame-graph";
import { useEbpfStore } from "@/store/modules/ebpf";
import { StackElement } from "@/types/ebpf";
import "d3-flame-graph/dist/d3-flamegraph.css";

/*global Nullable*/
const ebpfStore = useEbpfStore();
const stackTree = ref<Nullable<StackElement>>(null);
const graph = ref<Nullable<HTMLDivElement>>(null);
const flameChart = ref<any>(null);

function drawGraph() {
  if (flameChart.value) {
    flameChart.value.destroy();
  }
  if (!ebpfStore.analyzeTrees.length) {
    return (stackTree.value = null);
  }
  stackTree.value = processTree(ebpfStore.analyzeTrees);

  const w = (graph.value && graph.value.getBoundingClientRect().width) || 10;
  flameChart.value = flamegraph()
    .width(w - 15)
    .cellHeight(18)
    .transitionDuration(750)
    .minFrameSize(5)
    .transitionEase(d3.easeCubic as any)
    .sort(true)
    .title("")
    .selfValue(false)
    .setColorMapper((d, originalColor) =>
      d.highlight ? "#6aff8f" : originalColor
    );
  const tip = (d3tip as any)()
    .attr("class", "d3-tip")
    .direction("w")
    .html(
      (d: { data: StackElement }) =>
        `<div class="mb-5">Symbol: ${d.data.name}</div><div class="mb-5">Dump Count: ${d.data.dumpCount}</div>`
    );
  flameChart.value.tooltip(tip);
  d3.select("#graph-stack").datum(stackTree.value).call(flameChart.value);
}

function processTree(arr: StackElement[]) {
  const copyArr = JSON.parse(JSON.stringify(arr));
  const obj: any = {};
  let res = null;
  let min = 1;
  let max = 1;
  for (const item of copyArr) {
    item.originId = item.id;
    item.name = item.symbol;
    delete item.id;
    obj[item.originId] = item;
    if (item.dumpCount > max) {
      max = item.dumpCount;
    }
    if (item.dumpCount < min) {
      min = item.dumpCount;
    }
  }
  const scale = d3.scaleLinear().domain([min, max]).range([1, 200]);
  for (const item of copyArr) {
    if (item.parentId === "0") {
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
  }
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
</style>
