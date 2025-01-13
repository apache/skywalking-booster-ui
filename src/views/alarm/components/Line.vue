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
  <Graph :option="option" @select="clickEvent" />
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import type { EventParams } from "@/types/dashboard";
  import useLegendProcess from "@/hooks/useLegendProcessor";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { Themes } from "@/constants/data";

  /*global defineProps, defineEmits */
  const emits = defineEmits(["click"]);
  const props = defineProps({
    data: {
      type: Array as PropType<any>,
      default: () => [],
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  });
  const appStore = useAppStoreWithOut();
  const option = computed(() => getOption());
  function getOption() {
    const { chartColors } = useLegendProcess();
    const color: string[] = chartColors();
    const series = [];
    const grid = [];
    const xAxis = [];
    const yAxis = [];
    for (const [index, metric] of props.data.entries()) {
      grid.push({
        top: 300 * index + 30,
        left: 0,
        right: 10,
        bottom: 5,
        containLabel: true,
        height: 260,
      });
      xAxis.push({
        type: "category",
        show: true,
        axisTick: {
          lineStyle: { color: "#c1c5ca41" },
          alignWithLabel: true,
        },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "rgba(0,0,0,0)" } },
        axisLabel: { color: "#9da5b2", fontSize: "11" },
        gridIndex: index,
      });
      yAxis.push({
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#c1c5ca41", type: "dashed" } },
        axisLabel: {
          color: "#9da5b2",
          fontSize: "11",
          show: true,
        },
        gridIndex: index,
      });
      for (const item of metric.values) {
        series.push({
          data: item.values.map((item: number, itemIndex: number) => [props.intervalTime[itemIndex], item]),
          name: item.name || metric.name,
          type: "line",
          symbol: "circle",
          symbolSize: 4,
          xAxisIndex: index,
          yAxisIndex: index,
          lineStyle: {
            width: 2,
            type: "solid",
          },
        });
      }
    }
    const tooltip = {
      trigger: "axis",
      backgroundColor: appStore.theme === Themes.Dark ? "#333" : "#fff",
      borderColor: appStore.theme === Themes.Dark ? "#333" : "#fff",
      textStyle: {
        fontSize: 12,
        color: appStore.theme === Themes.Dark ? "#eee" : "#333",
      },
      enterable: true,
      confine: true,
      extraCssText: "max-height:85%; overflow: auto;",
      axisPointer: {
        animation: false,
      },
    };

    return {
      color,
      tooltip,
      axisPointer: {
        link: { xAxisIndex: "all" },
      },
      legend: {
        type: "scroll",
        icon: "circle",
        top: -5,
        left: 0,
        itemWidth: 12,
        textStyle: {
          color: appStore.theme === Themes.Dark ? "#fff" : "#333",
        },
      },
      grid,
      xAxis,
      yAxis,
      series,
    };
  }

  function clickEvent(params: EventParams) {
    emits("click", params);
  }
</script>
<style lang="scss" scoped>
  .snapshot-charts {
    width: 100%;
    height: 100%;
  }
</style>
