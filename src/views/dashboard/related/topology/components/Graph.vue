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
  <svg class="hierarchy-services-svg" :width="width" :height="height" @click="svgEvent" v-if="nodes.length">
    <g class="hierarchy-services-graph" :transform="`translate(${diff[0]}, ${diff[1]})`">
      <g
        class="topo-node"
        v-for="(n, index) in topologyLayout.nodes"
        :key="index"
        @mouseout="hideTip"
        @mouseover="showNodeTip($event, n)"
        @click="handleNodeClick($event, n)"
        @mousedown="startMoveNode($event, n)"
        @mouseup="stopMoveNode($event)"
      >
        <image width="36" height="36" :x="n.x - 15" :y="n.y - 18" :href="icons.CUBE" />
        <image width="28" height="25" :x="n.x - 14" :y="n.y - 43" :href="icons.LOCAL" style="opacity: 0.8" />
        <image
          width="12"
          height="12"
          :x="n.x - 6"
          :y="n.y - 38"
          :href="!n.layer || n.layer === `N/A` ? icons.MESH : icons[n.layer.toUpperCase().replace('-', '')]"
        />
        <text
          class="node-text"
          :x="n.x - (Math.min(n.name.length, 30) * 6) / 2 + 6"
          :y="n.y + n.width + 8"
          style="pointer-events: none"
        >
          {{ n.name.length > 30 ? `${n.name.substring(0, 30)}...` : n.name }}
        </text>
      </g>
      <g v-for="(l, index) in topologyLayout.calls" :key="index">
        <path
          class="topo-line"
          :d="`M${l.sourceX} ${l.sourceY} L${l.targetX} ${l.targetY}`"
          stroke="#97B0F8"
          marker-end="url(#arrow)"
        />
      </g>
      <g class="arrows">
        <defs v-for="(_, index) in topologyLayout.calls" :key="index">
          <marker
            id="arrow"
            markerUnits="strokeWidth"
            markerWidth="16"
            markerHeight="16"
            viewBox="0 0 12 12"
            refX="10"
            refY="6"
            orient="auto"
          >
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#97B0F8" />
          </marker>
        </defs>
      </g>
    </g>
  </svg>
  <div v-else class="hierarchy-services"> No Data</div>
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import { ref, computed, watch } from "vue";
  import * as d3 from "d3";
  import type { Node, Call } from "@/types/topology";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import icons from "@/assets/img/icons";
  import { changeNode, computeHierarchyLevels, hierarchy } from "./utils/layout";
  import zoom from "@/views/dashboard/related/components/utils/zoom";

  /*global Nullable, defineProps */
  const props = defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
    entity: {
      type: String,
      default: "",
    },
    nodes: {
      type: Array as PropType<Node[]>,
      default: () => [],
    },
    calls: {
      type: Array as PropType<Call[]>,
      default: () => [],
    },
    layerLevels: {
      type: Array as PropType<{ layer: string; level: number }[]>,
      default: () => [],
    },
  });
  const emits = defineEmits(["showNodeTip", "handleNodeClick", "hideTip", "getNodeMetrics"]);
  const dashboardStore = useDashboardStore();
  const height = ref<number>(100);
  const width = ref<number>(100);
  const svg = ref<Nullable<any>>(null);
  const graph = ref<Nullable<any>>(null);
  const topologyLayout = ref<any>({});
  const graphWidth = ref<number>(100);
  const graphHeight = ref<number>(100);
  const currentNode = ref<Nullable<Node>>(null);
  const diff = computed(() => [
    (width.value - graphWidth.value - 160) / 2,
    (height.value - graphHeight.value - 60) / 2,
  ]);
  const radius = 10;

  async function init() {
    const dom = document.querySelector(".hierarchy-related")?.getBoundingClientRect() || {
      height: 80,
      width: 0,
    };
    height.value = dom.height - 80;
    width.value = dom.width;
    svg.value = d3.select(".hierarchy-services-svg");
    graph.value = d3.select(".hierarchy-services-graph");
    emits("getNodeMetrics");
    draw();
    svg.value.call(zoom(d3, graph.value, diff.value));
  }

  function draw() {
    const levels = computeHierarchyLevels(props.nodes);
    topologyLayout.value = hierarchy(levels, props.calls, radius);
    graphWidth.value = topologyLayout.value.layout.width;
    graphHeight.value = topologyLayout.value.layout.height;
    const drag: any = d3.drag().on("drag", (d: { x: number; y: number }) => {
      topologyLayout.value.calls = changeNode(d, currentNode.value, topologyLayout.value, radius);
    });
    setTimeout(() => {
      d3.selectAll(".topo-node").call(drag);
    }, 1000);
  }

  function startMoveNode(event: MouseEvent, d: Node) {
    event.stopPropagation();
    currentNode.value = d;
  }
  function stopMoveNode(event: MouseEvent) {
    event.stopPropagation();
    currentNode.value = null;
    hideTip();
  }

  function showNodeTip(event: MouseEvent, data: Node) {
    emits("showNodeTip", event, data);
  }

  function hideTip() {
    emits("hideTip");
  }

  function handleNodeClick(event: MouseEvent, d: Node & { x: number; y: number }) {
    event.stopPropagation();
    emits("handleNodeClick", event, d);
  }

  function svgEvent() {
    if (!props.config) {
      return;
    }
    dashboardStore.selectWidget(props.config);
  }

  watch(
    () => [...props.calls, ...props.nodes],
    () => {
      if (!props.nodes.length) {
        return;
      }
      if (!props.calls.length) {
        return;
      }
      setTimeout(() => {
        init();
      }, 10);
    },
  );
</script>
<style lang="scss" scoped>
  .hierarchy-services-topo {
    .node-text {
      fill: var(--sw-topology-color);
      font-size: 12px;
      opacity: 0.9;
      z-index: 1;
    }

    .hierarchy-services-svg {
      cursor: move;
      background-color: var(--el-bg-color);
    }

    .label {
      color: var(--sw-topology-color);
      display: inline-block;
      margin-right: 5px;
    }

    .topo-line {
      stroke-linecap: round;
      stroke-width: 1px;
      stroke-dasharray: 10 10;
      fill: none;
      animation: var(--sw-topo-animation);
    }

    .topo-line-anchor,
    .topo-node {
      cursor: pointer;
    }
  }

  .hierarchy-services {
    align-items: center;
    display: flex;
    justify-content: center;
    height: 100%;
  }
</style>
