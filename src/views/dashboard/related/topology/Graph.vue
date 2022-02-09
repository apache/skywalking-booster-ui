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
  <div ref="chart" class="micro-topo-chart"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import * as d3 from "d3";
import d3tip from "d3-tip";
import zoom from "./utils/zoom";
import { simulationInit, simulationSkip } from "./utils/simulation";
import nodeElement from "./utils/nodeElement";
import { linkElement, anchorElement } from "./utils/linkElement";
import tool from "./utils/tool";
import topoLegend from "./utils/legend";
import { Node, Call } from "@/types/topology";
import { useTopologyStore } from "@/store/modules/topology";
import { useDashboardStore } from "@/store/modules/dashboard";
import { EntityType } from "../../data";

/*global defineProps, Nullable */
// const props = defineProps({
//   current: {
//     type: Object as PropType<{ [key: string]: number[] }>,
//     default: () => ({}),
//   },
//   nodes: { type: Array as PropType<Node[]>, default: () => [] },
//   links: { type: Array as PropType<Call[]>, default: () => [] },
// });
const { t } = useI18n();
const topologyStore = useTopologyStore();
const dashboardStore = useDashboardStore();
const height = ref<number>(document.body.clientHeight - 90);
const width = ref<number>(document.body.clientWidth - 40);
const simulation = ref<any>("");
const svg = ref<Nullable<any>>(null);
const chart = ref<HTMLDivElement | null>(null);
const tip = ref<any>(null);
const graph = ref<any>(null);
const node = ref<any>(null);
const link = ref<any>(null);
const anchor = ref<any>(null);
const tools = ref<any>(null);

onMounted(async () => {
  await getTopology();
  window.addEventListener("resize", resize);
  svg.value = d3
    .select(chart.value)
    .append("svg")
    .attr("class", "topo-svg")
    .attr("height", height.value)
    .attr("width", width.value);
  tip.value = (d3tip as any)().attr("class", "d3-tip").offset([-8, 0]);
  graph.value = svg.value.append("g").attr("class", "topo-svg_graph");
  graph.value.call(tip.value);
  simulation.value = simulationInit(
    d3,
    topologyStore.nodes,
    topologyStore.calls,
    ticked
  );
  node.value = graph.value.append("g").selectAll(".topo-node");
  link.value = graph.value.append("g").selectAll(".topo-line");
  anchor.value = graph.value.append("g").selectAll(".topo-line-anchor");
  // tools.value = tool(graph.value, [
  //   { icon: "API", click: handleGoEndpoint },
  //   { icon: "INSTANCE", click: handleGoInstance },
  //   { icon: "TRACE", click: handleGoTrace },
  //   { icon: "ALARM", click: handleGoAlarm },
  //   { icon: "ENDPOINT", click: handleGoEndpointDependency },
  //   { icon: "" },
  // ]);
  update();
});
async function getTopology() {
  switch (dashboardStore.entity) {
    case EntityType[0].value:
      await topologyStore.getServiceTopology();
      break;
    case EntityType[1].value:
      await topologyStore.getGlobalTopology();
      break;
    case EntityType[2].value:
      await topologyStore.getEndpointTopology();
      break;
    case EntityType[3].value:
      await topologyStore.getInstanceTopology();
      break;
  }
}
function resize() {
  height.value = document.body.clientHeight - 90;
  width.value = document.body.clientWidth - 40;
  svg.value.attr("height", height.value).attr("width", width.value);
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
    (d: any) =>
      `translate(${(d.source.x + d.target.x) / 2}, ${
        (d.target.y + d.source.y) / 2 - d.loopFactor * 45
      })`
  );
  node.value.attr(
    "transform",
    (d: Node | any) => `translate(${d.x - 22},${d.y - 22})`
  );
}
function dragstart(d: any) {
  node.value._groups[0].forEach((g: any) => {
    g.__data__.fx = g.__data__.x;
    g.__data__.fy = g.__data__.y;
  });
  if (!(d3 as any).event.active) {
    simulation.value.alphaTarget(0.1).restart();
  }
  (d3 as any).event.sourceEvent.stopPropagation();
}
function dragged(d: any) {
  d.fx = (d3 as any).event.x;
  d.fy = (d3 as any).event.y;
  d.x = d.fx;
  d.y = d.fy;
}
function dragended() {
  if (!(d3 as any).event.active) {
    simulation.value.alphaTarget(0);
  }
}
function handleNodeClick(d: any) {
  const { x, y, vx, vy, fx, fy, index, ...rest } = d;
  topologyStore.setNode(rest);
  topologyStore.setLink({});
}
function handleLinkClick(event: any, d: any) {
  event.stopPropagation();
  topologyStore.setNode({});
  topologyStore.setLink(d);
}
function update() {
  // node element
  node.value = node.value.data(topologyStore.nodes, (d: any) => d.id);
  node.value.exit().remove();
  node.value = nodeElement(
    d3,
    node.value.enter(),
    tools.value,
    {
      dragstart: dragstart,
      dragged: dragged,
      dragended: dragended,
      handleNodeClick: handleNodeClick,
    },
    tip.value
  ).merge(node.value);
  // line element
  link.value = link.value.data(topologyStore.calls, (d: any) => d.id);
  link.value.exit().remove();
  link.value = linkElement(link.value.enter()).merge(link.value);
  // anchorElement
  anchor.value = anchor.value.data(topologyStore.calls, (d: any) => d.id);
  anchor.value.exit().remove();
  anchor.value = anchorElement(
    anchor.value.enter(),
    {
      handleLinkClick: handleLinkClick,
      $tip: (data: any) =>
        `
            <div class="mb-5"><span class="grey">${t("cpm")}: </span>${
          data.cpm
        }</div>
            <div class="mb-5"><span class="grey">${t("latency")}: </span>${
          data.latency
        }</div>
            <div><span class="grey">${t(
              "detectPoint"
            )}:</span>${data.detectPoints.join(" | ")}</div>
          `,
    },
    tip.value
  ).merge(anchor.value);
  // force element
  simulation.value.nodes(topologyStore.nodes);
  simulation.value
    .force("link")
    .links(topologyStore.calls)
    .id((d: any) => d.id);
  simulationSkip(d3, simulation.value, ticked);
  const loopMap: any = {};
  for (let i = 0; i < topologyStore.calls.length; i++) {
    const link: any = topologyStore.calls[i];
    link.loopFactor = 1;
    for (let j = 0; j < topologyStore.calls.length; j++) {
      if (i === j || loopMap[i]) {
        continue;
      }
      const otherLink = topologyStore.calls[j];
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
onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
});
</script>
<style lang="scss">
@keyframes topo-dash {
  from {
    stroke-dashoffset: 20;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.micro-topo-chart {
  background: #333840;

  .topo-svg {
    display: block;
    width: 100%;
  }

  .topo-line {
    stroke-linecap: round;
    stroke-width: 3px !important;
    stroke-dasharray: 13 7;
    fill: none;
    animation: topo-dash 1s linear infinite !important;
  }

  .topo-line-anchor {
    cursor: pointer;
  }

  .topo-text {
    font-family: "Lato", "Source Han Sans CN", "Microsoft YaHei", sans-serif;
    fill: #ddd;
    font-size: 11px;
    opacity: 0.8;
  }

  .topo-tool {
    display: none;
  }

  .topo-tool-i {
    cursor: pointer;

    .tool-hexagon {
      fill: #3f4450;
      stroke: #217ef2;
      stroke-width: 2;
      stroke-opacity: 0.5;
    }

    &:hover {
      .tool-hexagon {
        stroke-opacity: 1;
      }
    }
  }
}
</style>
