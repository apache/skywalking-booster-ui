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
  <div
    class="switch-icon ml-5"
    title="Settings"
    @click="setConfig"
    v-if="dashboardStore.editMode"
  >
    <Icon size="middle" iconName="settings" />
  </div>
  <div class="setting" v-if="showSettings && dashboardStore.editMode">
    <Settings @update="updateSettings" @updateNodes="freshNodes" />
  </div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { ref, onMounted, watch } from "vue";
import * as d3 from "d3";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import router from "@/router";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import { useDashboardStore } from "@/store/modules/dashboard";
import d3tip from "d3-tip";
import {
  simulationInit,
  simulationSkip,
} from "../../components/D3Graph/simulation";
import {
  linkElement,
  anchorElement,
  arrowMarker,
} from "../../components/D3Graph/linkElement";
import nodeElement from "../../components/D3Graph/nodeElement";
import { Call } from "@/types/topology";
// import zoom from "../../components/D3Graph/zoom";
import { ProcessNode } from "@/types/ebpf";
import { useThrottleFn } from "@vueuse/core";
import Settings from "./Settings.vue";
import { EntityType } from "@/views/dashboard/data";
import getDashboard from "@/hooks/useDashboardsSession";

/*global Nullable, defineProps */
const props = defineProps({
  config: {
    type: Object as PropType<any>,
    default: () => ({ graph: {} }),
  },
});
const { t } = useI18n();
const dashboardStore = useDashboardStore();
const networkProfilingStore = useNetworkProfilingStore();
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
const oldVal = ref<{ width: number; height: number }>({ width: 0, height: 0 });
const showSettings = ref<boolean>(false);
const config = ref<any>({});

onMounted(() => {
  init();
  oldVal.value = (chart.value && chart.value.getBoundingClientRect()) || {
    width: 0,
    height: 0,
  };
});

async function init() {
  svg.value = d3.select(chart.value).append("svg").attr("class", "process-svg");
  if (!networkProfilingStore.nodes.length) {
    return;
  }
  drawGraph();
  update();
}

function drawGraph() {
  const dom = chart.value?.getBoundingClientRect() || {
    height: 20,
    width: 0,
  };
  height.value = dom.height - 20;
  width.value = dom.width;
  svg.value.attr("height", height.value).attr("width", width.value);
  tip.value = (d3tip as any)().attr("class", "d3-tip").offset([-8, 0]);
  graph.value = svg.value
    .append("g")
    .attr("class", "svg-graph")
    .attr("transform", `translate(-250, -220)`);
  graph.value.call(tip.value);
  simulation.value = simulationInit(
    d3,
    networkProfilingStore.nodes,
    networkProfilingStore.calls,
    ticked
  );
  node.value = graph.value.append("g").selectAll(".topo-node");
  link.value = graph.value.append("g").selectAll(".topo-line");
  anchor.value = graph.value.append("g").selectAll(".topo-line-anchor");
  arrow.value = graph.value.append("g").selectAll(".topo-line-arrow");
  // svg.value.call(zoom(d3, graph.value));
  svg.value.on("click", (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    networkProfilingStore.setNode(null);
    networkProfilingStore.setLink(null);
    dashboardStore.selectWidget(props.config);
  });
  useThrottleFn(resize, 500)();
}

function update() {
  // node element
  if (!node.value || !link.value) {
    return;
  }
  node.value = node.value.data(
    networkProfilingStore.nodes,
    (d: ProcessNode) => d.id
  );
  node.value.exit().remove();
  node.value = nodeElement(
    d3,
    node.value.enter(),
    {
      tipHtml: (data: ProcessNode) => {
        return ` <div class="mb-5"><span class="grey">name: </span>${data.name}</div>`;
      },
    },
    tip.value
  ).merge(node.value);
  // line element
  link.value = link.value.data(networkProfilingStore.calls, (d: Call) => d.id);
  link.value.exit().remove();
  link.value = linkElement(link.value.enter()).merge(link.value);
  // anchorElement
  anchor.value = anchor.value.data(
    networkProfilingStore.calls,
    (d: Call) => d.id
  );
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
  arrow.value = arrow.value.data(
    networkProfilingStore.calls,
    (d: Call) => d.id
  );
  arrow.value.exit().remove();
  arrow.value = arrowMarker(arrow.value.enter()).merge(arrow.value);
  // force element
  simulation.value.nodes(networkProfilingStore.nodes);
  simulation.value
    .force("link")
    .links(networkProfilingStore.calls)
    .id((d: Call) => d.id);
  const loopMap: any = {};
  for (let i = 0; i < networkProfilingStore.calls.length; i++) {
    const link: any = networkProfilingStore.calls[i];
    link.loopFactor = 1;
    for (let j = 0; j < networkProfilingStore.calls.length; j++) {
      if (i === j || loopMap[i]) {
        continue;
      }
      const otherLink = networkProfilingStore.calls[j];
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
  networkProfilingStore.setNode(null);
  networkProfilingStore.setLink(d);
  if (!config.value.linkDashboard) {
    return;
  }
  const { dashboard } = getDashboard({
    name: config.value.linkDashboard,
    layer: dashboardStore.layerId,
    entity: EntityType[7].value,
  });
  if (!dashboard) {
    ElMessage.error(
      `The dashboard named ${config.value.linkDashboard} doesn't exist`
    );
    return;
  }
  const path = `/dashboard/related/${dashboard.layer}/${EntityType[7].value}/${d.source.id}/${d.target.id}/${dashboard.name}`;
  const routeUrl = router.resolve({ path });
  window.open(routeUrl.href, "_blank");
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

function updateSettings(config: any) {
  config.value = config;
}

function setConfig() {
  showSettings.value = !showSettings.value;
  dashboardStore.selectWidget(props.config);
}

function resize() {
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const cr = entry.contentRect;
    if (
      Math.abs(cr.width - oldVal.value.width) < 5 &&
      Math.abs(cr.height - oldVal.value.height) < 5
    ) {
      return;
    }
    freshNodes();
    oldVal.value = { width: cr.width, height: cr.height };
  });
  if (chart.value) {
    observer.observe(chart.value);
  }
}

async function freshNodes() {
  svg.value.selectAll(".svg-graph").remove();
  if (!networkProfilingStore.nodes.length) {
    return;
  }
  drawGraph();
  update();
}
watch(
  () => networkProfilingStore.nodes,
  () => {
    freshNodes();
  }
);
</script>
<style lang="scss" scoped>
.micro-topo-chart {
  width: calc(100% - 10px);
  margin: 0 5px 5px 0;
  height: 100%;
  min-height: 150px;
}

.process-svg {
  width: 100%;
  height: calc(100% - 10px);
  cursor: move;
}

.switch-icon {
  cursor: pointer;
  transition: all 0.5ms linear;
  background-color: #252a2f99;
  color: #ddd;
  display: inline-block;
  padding: 5px 8px 8px;
  border-radius: 3px;
  position: absolute;
  top: 20px;
  right: 10px;
}

.setting {
  position: absolute;
  top: 65px;
  right: 10px;
  width: 300px;
  height: 160px;
  background-color: #2b3037;
  overflow: auto;
  padding: 15px;
  border-radius: 3px;
  color: #ccc;
  transition: all 0.5ms linear;
}
</style>
