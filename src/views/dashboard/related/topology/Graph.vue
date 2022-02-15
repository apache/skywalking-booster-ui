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
  <div
    ref="chart"
    class="micro-topo-chart"
    v-loading="loading"
    :style="`height: ${height}px`"
  >
    <div class="setting" v-show="showSetting">
      <Settings @update="updateSettings" />
    </div>
    <div class="tool">
      <span class="switch-icon ml-5" title="Settings">
        <Icon @click="setConfig" size="middle" iconName="settings" />
      </span>
      <span class="switch-icon ml-5" title="Back to overview topology">
        <Icon
          @click="backToTopology"
          size="middle"
          iconName="keyboard_backspace"
        />
      </span>
    </div>
    <div
      class="operations-list"
      v-if="topologyStore.node"
      :style="{
        top: operationsPos.y + 'px',
        left: operationsPos.x + 'px',
      }"
    >
      <span v-for="(item, index) of items" :key="index" @click="item.func">
        {{ item.title }}
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, reactive } from "vue";
import { useI18n } from "vue-i18n";
import * as d3 from "d3";
import d3tip from "d3-tip";
import zoom from "./utils/zoom";
import { simulationInit, simulationSkip } from "./utils/simulation";
import nodeElement from "./utils/nodeElement";
import { linkElement, anchorElement, arrowMarker } from "./utils/linkElement";
import topoLegend from "./utils/legend";
import { Node, Call } from "@/types/topology";
import { useSelectorStore } from "@/store/modules/selectors";
import { useTopologyStore } from "@/store/modules/topology";
import { useDashboardStore } from "@/store/modules/dashboard";
import { EntityType } from "../../data";
import router from "@/router";
import { ElMessage } from "element-plus";
import Settings from "./Settings.vue";

/*global Nullable */
const { t } = useI18n();
const selectorStore = useSelectorStore();
const topologyStore = useTopologyStore();
const dashboardStore = useDashboardStore();
const height = ref<number>(document.body.clientHeight - 90);
const width = ref<number>(document.body.clientWidth - 40);
const loading = ref<boolean>(false);
const simulation = ref<any>(null);
const svg = ref<Nullable<any>>(null);
const chart = ref<Nullable<HTMLDivElement>>(null);
const tip = ref<any>(null);
const graph = ref<any>(null);
const node = ref<any>(null);
const link = ref<any>(null);
const anchor = ref<any>(null);
const arrow = ref<any>(null);
const legend = ref<any>(null);
const showSetting = ref<boolean>(false);
const settings = ref<any>({});
const operationsPos = reactive<{ x: number; y: number }>({ x: NaN, y: NaN });
const items = ref([
  { id: "inspect", title: "Inspect", func: handleInspect },
  { id: "alarm", title: "Alarm", func: handleGoAlarm },
]);

onMounted(async () => {
  loading.value = true;
  const resp = await getTopology();
  loading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
  }
  window.addEventListener("resize", resize);
  svg.value = d3
    .select(chart.value)
    .append("svg")
    .attr("class", "topo-svg")
    .attr("height", height.value)
    .attr("width", width.value);
  await init();
  update();
});
async function init() {
  tip.value = (d3tip as any)().attr("class", "d3-tip").offset([-8, 0]);
  graph.value = svg.value.append("g").attr("class", "topo-svg-graph");
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
  arrow.value = graph.value.append("g").selectAll(".topo-line-arrow");
  svg.value.call(zoom(d3, graph.value));
  // legend
  legend.value = graph.value.append("g").attr("class", "topo-legend");
  topoLegend(legend.value, height.value, width.value);
  svg.value.on("click", (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    topologyStore.setNode(null);
    topologyStore.setLink(null);
    // showSetting.value = false;
  });
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
function dragstart(d: any) {
  node.value._groups[0].forEach((g: any) => {
    g.__data__.fx = g.__data__.x;
    g.__data__.fy = g.__data__.y;
  });
  if (!d.active) {
    simulation.value.alphaTarget(0.1).restart();
  }
  d.subject.fx = d.subject.x;
  d.subject.fy = d.subject.y;
  d.sourceEvent.stopPropagation();
}
function dragged(d: any) {
  d.subject.fx = d.x;
  d.subject.fy = d.y;
}
function dragended(d: any) {
  if (!d.active) {
    simulation.value.alphaTarget(0);
  }
}
function handleNodeClick(d: Node & { x: number; y: number }) {
  topologyStore.setNode(d);
  topologyStore.setLink(null);
  operationsPos.x = d.x;
  operationsPos.y = d.y + 30;
  if (d.layer === String(dashboardStore.layerId)) {
    return;
  }
  items.value = [
    { id: "inspect", title: "Inspect", func: handleInspect },
    { id: "alarm", title: "Alarm", func: handleGoAlarm },
  ];
}
function handleLinkClick(event: any, d: Call) {
  if (
    d.source.layer !== dashboardStore.layerId ||
    d.target.layer !== dashboardStore.layerId
  ) {
    return;
  }
  event.stopPropagation();
  topologyStore.setNode(null);
  topologyStore.setLink(d);
  const e =
    dashboardStore.entity === EntityType[1].value
      ? EntityType[0].value
      : dashboardStore.entity;
  const path = `/dashboard/${dashboardStore.layerId}/${e}Relation/${d.source.id}/${d.target.id}/${settings.value.linkDashboard}`;
  const routeUrl = router.resolve({ path });
  window.open(routeUrl.href, "_blank");
}
function update() {
  // node element
  if (!node.value || !link.value) {
    return;
  }
  node.value = node.value.data(topologyStore.nodes, (d: Node) => d.id);
  node.value.exit().remove();
  node.value = nodeElement(
    d3,
    node.value.enter(),
    {
      dragstart: dragstart,
      dragged: dragged,
      dragended: dragended,
      handleNodeClick: handleNodeClick,
      tipHtml: (data: Node) => {
        const nodeMetrics: string[] = settings.value.nodeMetrics || [];
        const html = nodeMetrics.map((m) => {
          const metric =
            topologyStore.nodeMetrics[m].values.filter(
              (val: { id: string; value: unknown }) => val.id === data.id
            )[0] || {};
          return ` <div class="mb-5"><span class="grey">${m}: </span>${metric.value}</div>`;
        });
        return [
          ` <div class="mb-5"><span class="grey">name: </span>${data.name}</div>`,
          ...html,
        ].join(" ");
      },
    },
    tip.value
  ).merge(node.value);
  // line element
  link.value = link.value.data(topologyStore.calls, (d: Call) => d.id);
  link.value.exit().remove();
  link.value = linkElement(link.value.enter()).merge(link.value);
  // anchorElement
  anchor.value = anchor.value.data(topologyStore.calls, (d: Call) => d.id);
  anchor.value.exit().remove();
  anchor.value = anchorElement(
    anchor.value.enter(),
    {
      handleLinkClick: handleLinkClick,
      tipHtml: (data: Call) => {
        const linkClientMetrics: string[] =
          settings.value.linkClientMetrics || [];
        const linkServerMetrics: string[] =
          settings.value.linkServerMetrics || [];
        const htmlServer = linkServerMetrics.map((m) => {
          const metric = topologyStore.linkServerMetrics[m].values.filter(
            (val: { id: string; value: unknown }) => val.id === data.id
          )[0];
          if (metric) {
            return ` <div class="mb-5"><span class="grey">${m}: </span>${metric.value}</div>`;
          }
        });
        const htmlClient = linkClientMetrics.map((m) => {
          const metric = topologyStore.linkClientMetrics[m].values.filter(
            (val: { id: string; value: unknown }) => val.id === data.id
          )[0];
          if (metric) {
            return ` <div class="mb-5"><span class="grey">${m}: </span>${metric.value}</div>`;
          }
        });
        const html = [
          ...htmlServer,
          ...htmlClient,
          `<div><span class="grey">${t(
            "detectPoint"
          )}:</span>${data.detectPoints.join(" | ")}</div>`,
        ].join(" ");

        return html;
      },
    },
    tip.value
  ).merge(anchor.value);
  // arrow marker
  arrow.value = arrow.value.data(topologyStore.calls, (d: Call) => d.id);
  arrow.value.exit().remove();
  arrow.value = arrowMarker(arrow.value.enter()).merge(arrow.value);
  // force element
  simulation.value.nodes(topologyStore.nodes);
  simulation.value
    .force("link")
    .links(topologyStore.calls)
    .id((d: Call) => d.id);
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
async function handleInspect() {
  svg.value.selectAll(".topo-svg-graph").remove();
  const id = topologyStore.node.id;
  topologyStore.setNode(null);
  topologyStore.setLink(null);
  loading.value = true;
  const resp = await topologyStore.getServiceTopology(id);
  loading.value = false;

  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
  await init();
  update();
}
function handleGoEndpoint() {
  const path = `/dashboard/${dashboardStore.layerId}/Endpoint/${topologyStore.node.id}/${settings.value.endpointDashboard}`;
  const routeUrl = router.resolve({ path });

  window.open(routeUrl.href, "_blank");
}
function handleGoInstance() {
  const path = `/dashboard/${dashboardStore.layerId}/ServiceInstance/${topologyStore.node.id}/${settings.value.instanceDashboard}`;
  const routeUrl = router.resolve({ path });

  window.open(routeUrl.href, "_blank");
}
function handleGoDashboard() {
  const path = `/dashboard/${dashboardStore.layerId}/Service/${topologyStore.node.id}/${settings.value.nodeDashboard}`;
  const routeUrl = router.resolve({ path });

  window.open(routeUrl.href, "_blank");
}
function handleGoAlarm() {
  const path = `/alarm`;
  const routeUrl = router.resolve({ path });

  window.open(routeUrl.href, "_blank");
}
async function backToTopology() {
  svg.value.selectAll(".topo-svg-graph").remove();
  loading.value = true;
  const resp = await getTopology();
  loading.value = false;

  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
  await init();
  update();
  topologyStore.setNode(null);
  topologyStore.setLink(null);
}
async function getTopology() {
  let resp;
  switch (dashboardStore.entity) {
    case EntityType[0].value:
      resp = await topologyStore.getServiceTopology(
        selectorStore.currentService.id
      );
      break;
    case EntityType[1].value:
      resp = await topologyStore.getServicesTopology();
      break;
  }
  return resp;
}
function setConfig() {
  showSetting.value = !showSetting.value;
}
function resize() {
  height.value = document.body.clientHeight - 90;
  width.value = document.body.clientWidth - 40;
  svg.value.attr("height", height.value).attr("width", width.value);
}
function updateSettings(config: any) {
  items.value = [
    { id: "inspect", title: "Inspect", func: handleInspect },
    { id: "alarm", title: "Alarm", func: handleGoAlarm },
  ];
  settings.value = config;
  if (config.nodeDashboard) {
    items.value.push({
      id: "dashboard",
      title: "Dashboard",
      func: handleGoDashboard,
    });
  }
  if (config.instanceDashboard) {
    items.value.push({
      id: "instance",
      title: "Instance",
      func: handleGoInstance,
    });
  }
  if (config.endpointDashboard) {
    items.value.push({
      id: "endpoint",
      title: "Endpoint",
      func: handleGoEndpoint,
    });
  }
}
onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
});
</script>
<style lang="scss">
.micro-topo-chart {
  position: relative;

  .setting {
    position: absolute;
    top: 70px;
    right: 0;
    width: 360px;
    height: 700px;
    background-color: #2b3037;
    overflow: auto;
    padding: 0 15px;
    border-radius: 3px;
    color: #ccc;
    transition: all 0.5ms linear;
  }

  .operations-list {
    position: absolute;
    padding: 10px;
    color: #333;
    cursor: pointer;
    background-color: #fff;
    border-radius: 3px;

    span {
      display: block;
      height: 30px;
      width: 100px;
      line-height: 30px;
      text-align: center;
    }

    span:hover {
      color: #409eff;
      background-color: #eee;
    }
  }

  .tool {
    position: absolute;
    top: 22px;
    right: 0;
  }

  .switch-icon {
    cursor: pointer;
    transition: all 0.5ms linear;
    background-color: #252a2f99;
    color: #ddd;
    display: inline-block;
    padding: 5px 8px 8px;
    border-radius: 3px;
  }

  .topo-svg {
    display: block;
    width: 100%;
  }

  .topo-line {
    stroke-linecap: round;
    stroke-width: 3px;
    stroke-dasharray: 13 7;
    fill: none;
    animation: topo-dash 0.5s linear infinite;
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

.d3-tip {
  line-height: 1;
  padding: 8px;
  color: #eee;
  border-radius: 4px;
  font-size: 12px;
  z-index: 9999;
  background: #252a2f;
}

.d3-tip:after {
  box-sizing: border-box;
  display: block;
  font-size: 10px;
  width: 100%;
  line-height: 0.8;
  color: #252a2f;
  content: "\25BC";
  position: absolute;
  text-align: center;
}

.d3-tip.n:after {
  margin: -2px 0 0 0;
  top: 100%;
  left: 0;
}
@keyframes topo-dash {
  from {
    stroke-dashoffset: 20;
  }

  to {
    stroke-dashoffset: 0;
  }
}
</style>
