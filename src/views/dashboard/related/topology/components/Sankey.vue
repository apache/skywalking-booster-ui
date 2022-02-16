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
  <Graph :option="option" @select="clickChart" />
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useTopologyStore } from "@/store/modules/topology";
import { Node, Call } from "@/types/topology";

/*global defineEmits */
const emit = defineEmits(["click"]);
const topologyStore = useTopologyStore();
const option = computed(() => getOption());

function getOption() {
  return {
    tooltip: {
      trigger: "item",
    },
    series: {
      type: "sankey",
      left: 40,
      top: 20,
      right: 300,
      bottom: 40,
      emphasis: { focus: "adjacency" },
      data: topologyStore.nodes,
      links: topologyStore.calls,
      label: {
        color: "#fff",
        formatter: (param: any) => param.data.name,
      },
      color: [
        "#3fe1da",
        "#6be6c1",
        "#3fcfdc",
        "#626c91",
        "#3fbcde",
        "#a0a7e6",
        "#3fa9e1",
        "#96dee8",
        "#bf99f8",
      ],
      itemStyle: {
        borderWidth: 0,
      },
      lineStyle: {
        color: "source",
        opacity: 0.12,
      },
      tooltip: {
        position: "bottom",
        formatter: (param: { data: any; dataType: string }) => {
          if (param.dataType === "edge") {
            return linkTooltip(param.data);
          }
          return nodeTooltip(param.data);
        },
      },
    },
  };
}
function linkTooltip(data: Call) {
  const clientMetrics: string[] = Object.keys(topologyStore.linkClientMetrics);
  const serverMetrics: string[] = Object.keys(topologyStore.linkServerMetrics);
  const htmlServer = serverMetrics.map((m) => {
    const metric = topologyStore.linkServerMetrics[m].values.filter(
      (val: { id: string; value: unknown }) => val.id === data.id
    )[0];
    if (metric) {
      return ` <div><span>${m}: </span>${metric.value}</div>`;
    }
  });
  const htmlClient = clientMetrics.map((m) => {
    const metric = topologyStore.linkClientMetrics[m].values.filter(
      (val: { id: string; value: unknown }) => val.id === data.id
    )[0];
    if (metric) {
      return ` <div><span>${m}: </span>${metric.value}</div>`;
    }
  });
  const html = [
    `<div>${data.sourceObj.serviceName} -> ${data.targetObj.serviceName}</div>`,
    ...htmlServer,
    ...htmlClient,
  ].join(" ");

  return html;
}

function nodeTooltip(data: Node) {
  const nodeMetrics: string[] = Object.keys(topologyStore.nodeMetrics);
  const html = nodeMetrics.map((m) => {
    const metric =
      topologyStore.nodeMetrics[m].values.filter(
        (val: { id: string; value: unknown }) => val.id === data.id
      )[0] || {};
    return ` <div><span>${m}: </span>${metric.value}</div>`;
  });
  return [` <div><span>name: </span>${data.serviceName}</div>`, ...html].join(
    " "
  );
}

function clickChart(param: any) {
  emit("click", param);
}
</script>
<style lang="scss" scoped>
.sankey {
  width: 100%;
  height: 100%;
}
</style>
