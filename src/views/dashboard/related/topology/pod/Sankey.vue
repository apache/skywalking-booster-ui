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
  import type { PropType } from "vue";
  import { computed } from "vue";
  import { useTopologyStore } from "@/store/modules/topology";
  import type { Node, Call } from "@/types/topology";
  import type { MetricConfigOpt } from "@/types/dashboard";
  import { aggregation } from "@/hooks/useMetricsProcessor";
  import { MetricModes } from "@/views/dashboard/data";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { Themes } from "@/constants/data";

  /*global defineEmits, defineProps */
  const props = defineProps({
    settings: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
  });
  const emit = defineEmits(["click"]);
  const appStore = useAppStoreWithOut();
  const topologyStore = useTopologyStore();
  const option = computed(() => getOption());

  function getOption() {
    return {
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: appStore.theme === Themes.Dark ? "#333" : "#fff",
        borderColor: appStore.theme === Themes.Dark ? "#333" : "#fff",
        textStyle: {
          fontSize: 12,
          color: appStore.theme === Themes.Dark ? "#eee" : "#333",
        },
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
          color: appStore.theme === Themes.Dark ? "#ccc" : "#666",
          formatter: (param: any) => param.data.name,
        },
        color: ["#6be6c1", "#3fcfdc", "#626c91", "#3fbcde", "#a0a7e6", "#3fa9e1", "#96dee8", "#bf99f8"],
        itemStyle: {
          borderWidth: 0,
        },
        lineStyle: {
          color: "source",
          opacity: 0.3,
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
    const clientMetrics: string[] =
      props.settings.metricMode === MetricModes.Expression
        ? props.settings.linkClientExpressions
        : props.settings.linkClientMetrics;
    const serverMetrics: string[] =
      props.settings.metricMode === MetricModes.Expression
        ? props.settings.linkServerExpressions
        : props.settings.linkServerMetrics;
    const linkServerMetricConfig: MetricConfigOpt[] = props.settings.linkServerMetricConfig || [];
    const linkClientMetricConfig: MetricConfigOpt[] = props.settings.linkClientMetricConfig || [];

    const htmlServer = serverMetrics.map((m, index) => {
      const metric =
        topologyStore.linkServerMetrics[m].values.find((val: { id: string; value: unknown }) => val.id === data.id) ||
        {};
      if (metric) {
        const opt: MetricConfigOpt = linkServerMetricConfig[index] || {};
        const v = aggregation(metric.value, opt);
        return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || ""}</div>`;
      }
    });
    const htmlClient = clientMetrics.map((m, index) => {
      const opt: MetricConfigOpt = linkClientMetricConfig[index] || {};
      const metric =
        topologyStore.linkClientMetrics[m].values.find((val: { id: string; value: unknown }) => val.id === data.id) ||
        {};
      const v = aggregation(metric.value, opt);
      return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || ""}</div>`;
    });
    const html = [
      `<div>${data.sourceObj.serviceName} -> ${data.targetObj.serviceName}</div>`,
      ...htmlServer,
      ...htmlClient,
    ].join(" ");

    return html;
  }

  function nodeTooltip(data: Node) {
    const nodeMetrics: string[] =
      props.settings.metricMode === MetricModes.Expression
        ? props.settings.nodeExpressions
        : props.settings.nodeMetrics;
    const nodeMetricConfig = props.settings.nodeMetricConfig || [];
    const html = nodeMetrics.map((m, index) => {
      const metric =
        topologyStore.nodeMetricValue[m].values.find((val: { id: string; value: unknown }) => val.id === data.id) || {};
      const opt: MetricConfigOpt = nodeMetricConfig[index] || {};
      const v = aggregation(metric.value, opt);
      return ` <div class="mb-5"><span class="grey">${opt.label || m}: </span>${v} ${opt.unit || ""}</div>`;
    });
    return [` <div><span>name: </span>${data.serviceName}</div>`, ...html].join(" ");
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
