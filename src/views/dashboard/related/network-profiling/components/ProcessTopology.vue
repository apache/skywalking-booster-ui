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
  <div ref="chart" class="topology"></div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { ref, onMounted } from "vue";
import * as d3 from "d3";
import { useI18n } from "vue-i18n";
import { useEbpfStore } from "@/store/modules/ebpf";
import { useSelectorStore } from "@/store/modules/selectors";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import d3tip from "d3-tip";
import { simulationInit, simulationSkip } from "./utils/simulation";
import { linkElement, anchorElement, arrowMarker } from "./utils/linkElement";
import nodeElement from "./utils/nodeElement";
import { Call } from "@/types/topology";
import zoom from "./utils/zoom";
import { ProcessNode } from "@/types/ebpf";

/*global Nullable, defineProps */
const props = defineProps({
  config: {
    type: Object as PropType<any>,
    default: () => ({ graph: {} }),
  },
});
const { t } = useI18n();
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const ebpfStore = useEbpfStore();
const appStore = useAppStoreWithOut();
const height = ref<number>(100);
const width = ref<number>(100);
const simulation = ref<any>(null);
const svg = ref<Nullable<any>>(null);
const chart = ref<Nullable<HTMLDivElement>>(null);
const tip = ref<Nullable<HTMLDivElement>>(null);
const graph = ref<any>(null);
const node = ref<any>(null);
const link = ref<any>(null);
const anchor = ref<any>(null);
const arrow = ref<any>(null);

onMounted(() => {
  init();
});

async function init() {
  await getTopology();

  const dom = document.querySelector(".topology")?.getBoundingClientRect() || {
    height: 40,
    width: 0,
  };
  height.value = dom.height - 40;
  width.value = dom.width;
  svg.value = d3.select(chart.value).append("svg").attr("class", "process-svg");
  drawGraph();
  update();
}

function drawGraph() {
  tip.value = (d3tip as any)().attr("class", "d3-tip").offset([-8, 0]);
  graph.value = svg.value
    .append("g")
    .attr("class", "svg-graph")
    .attr("transform", `translate(-100, -100)`);
  graph.value.call(tip.value);
  simulation.value = simulationInit(
    d3,
    ebpfStore.nodes,
    ebpfStore.calls,
    ticked
  );
  node.value = graph.value.append("g").selectAll(".topo-node");
  link.value = graph.value.append("g").selectAll(".topo-line");
  anchor.value = graph.value.append("g").selectAll(".topo-line-anchor");
  arrow.value = graph.value.append("g").selectAll(".topo-line-arrow");
  svg.value.call(zoom(d3, graph.value));
  svg.value.on("click", (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    ebpfStore.setNode(null);
    ebpfStore.setLink(null);
    dashboardStore.selectWidget(props.config);
  });
}
function update() {
  // node element
  if (!node.value || !link.value) {
    return;
  }
  node.value = node.value.data(ebpfStore.nodes, (d: ProcessNode) => d.id);
  node.value.exit().remove();
  node.value = nodeElement(
    d3,
    node.value.enter(),
    {
      // dragstart: dragstart,
      // dragged: dragged,
      // dragended: dragended,
      handleNodeClick: handleNodeClick,
      tipHtml: (data: ProcessNode) => {
        return ` <div class="mb-5"><span class="grey">name: </span>${data.name}</div>`;
      },
    },
    tip.value
  ).merge(node.value);
  // line element
  link.value = link.value.data(ebpfStore.calls, (d: Call) => d.id);
  link.value.exit().remove();
  link.value = linkElement(link.value.enter()).merge(link.value);
  // anchorElement
  anchor.value = anchor.value.data(ebpfStore.calls, (d: Call) => d.id);
  anchor.value.exit().remove();
  anchor.value = anchorElement(
    anchor.value.enter(),
    {
      handleLinkClick: handleLinkClick,
      tipHtml: (data: Call) => {
        const html = `<div><span class="grey">${t(
          "detectPoint"
        )}:</span>${data.detectPoints.join(" | ")}</div>`;
        return html;
      },
    },
    tip.value
  ).merge(anchor.value);
  // arrow marker
  arrow.value = arrow.value.data(ebpfStore.calls, (d: Call) => d.id);
  arrow.value.exit().remove();
  arrow.value = arrowMarker(arrow.value.enter()).merge(arrow.value);
  // force element
  simulation.value.nodes(ebpfStore.nodes);
  simulation.value
    .force("link")
    .links(ebpfStore.calls)
    .id((d: Call) => d.id);
  simulationSkip(d3, simulation.value, ticked);
  const loopMap: any = {};
  for (let i = 0; i < ebpfStore.calls.length; i++) {
    const link: any = ebpfStore.calls[i];
    link.loopFactor = 1;
    for (let j = 0; j < ebpfStore.calls.length; j++) {
      if (i === j || loopMap[i]) {
        continue;
      }
      const otherLink = ebpfStore.calls[j];
      if (
        link.source.id === otherLink.target.id &&
        link.target.id === otherLink.source.id
      ) {
        link.loopFactor = -1;
        loopMap[j] = 1;
        break;
      }
    }
  }
}

function handleLinkClick(event: any, d: Call) {
  if (
    d.source.layer !== dashboardStore.layerId ||
    d.target.layer !== dashboardStore.layerId
  ) {
    return;
  }
  event.stopPropagation();
  ebpfStore.setNode(null);
  ebpfStore.setLink(d);
}

function ticked() {
  link.value.attr(
    "d",
    (d: Call | any) =>
      `M${d.source.x} ${d.source.y} Q ${(d.source.x + d.target.x) / 2} ${
        (d.target.y + d.source.y) / 2 - d.loopFactor * 90
      } ${d.target.x} ${d.target.y}`
  );
  anchor.value.attr(
    "transform",
    (d: Call | any) =>
      `translate(${(d.source.x + d.target.x) / 2}, ${
        (d.target.y + d.source.y) / 2 - d.loopFactor * 45
      })`
  );
  node.value.attr(
    "transform",
    (d: Node | any) => `translate(${d.x - 22},${d.y - 22})`
  );
}

function getTopology() {
  const serviceInstanceId =
    (selectorStore.currentPod && selectorStore.currentPod.id) || "";
  ebpfStore.getProcessTopology({
    serviceInstanceId,
    duration: appStore.durationTime,
  });
}

function handleNodeClick(d: Node & { x: number; y: number }) {
  ebpfStore.setNode(d);
  ebpfStore.setLink(null);
}
</script>
<style lang="scss" scoped>
.topology {
  width: calc(100% - 5px);
  margin: 0 5px 5px 0;
  height: 100%;
  min-height: 150px;
}

.topo-svg {
  width: 100%;
  height: calc(100% - 5px);
  cursor: move;
}
</style>
