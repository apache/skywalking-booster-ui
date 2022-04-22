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
  <div id="graph-stack" ref="graph"></div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import * as d3 from "d3";
import { flamegraph } from "d3-flame-graph";
import { useEbpfStore } from "@/store/modules/ebpf";
import { StackElement } from "@/types/ebpf";
import { json } from "./json";
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
    .width(w - 10)
    .cellHeight(18)
    .transitionDuration(750)
    .minFrameSize(5)
    .transitionEase(d3.easeCubic as any)
    .sort(true)
    .title("")
    .onClick(onClick)
    .selfValue(false)
    .setColorMapper((d, originalColor) =>
      d.highlight ? "#6aff8f" : originalColor
    );
  // stackTree.value = (json as any);
  console.log(stackTree.value);
  d3.select("#graph-stack")
    .datum(stackTree.value)
    .call(flameChart.value)
    .call(invokeFind);
}

function onClick(d: any) {
  console.info(`Clicked on ${d.data.name}, id: "${d.data.value}"`);
}

function resetZoom() {
  if (!flameChart.value) {
    return;
  }
  flameChart.value.resetZoom();
}

function invokeFind() {
  const searchId = parseInt(location.hash.substring(1), 10);
  if (searchId) {
    find(searchId);
  }
}
function find(id: number) {
  var elem = flameChart.value.findById(id);
  if (elem) {
    flameChart.value.zoomTo(elem);
  }
}

function processTree(arr: StackElement[]) {
  const copyArr = JSON.parse(JSON.stringify(arr));
  const obj: any = {};
  let res = null;
  for (const item of copyArr) {
    item.originId = item.id;
    item.value = item.dumpCount;
    item.name = item.symbol;
    delete item.id;
    obj[item.originId] = item;
  }
  for (const item of copyArr) {
    if (item.parentId === "0") {
      res = item;
    }
    for (const key in obj) {
      if (item.originId === obj[key].parentId) {
        if (item.children) {
          item.children.push(obj[key]);
        } else {
          item.children = [obj[key]];
        }
      }
    }
  }
  return res;
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
  height: 350px;
  cursor: pointer;
}
</style>
