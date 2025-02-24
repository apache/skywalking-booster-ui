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
  <div class="graph flex-v" :class="setRight ? 'flex-h' : 'flex-v'">
    <Graph
      :option="option"
      :filters="config.filters"
      :relatedTrace="config.relatedTrace"
      :associate="config.associate || []"
      :legendSelector="{ isSelector: legendSelector, sConfigPage: dashboardStore.showConfig }"
      @select="clickEvent"
    />
    <Legend :config="config.legend" :data="data" :intervalTime="intervalTime" />
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import type { PropType } from "vue";
  import type { LineConfig, EventParams, RelatedTrace, Filters } from "@/types/dashboard";
  import Legend from "./components/Legend.vue";
  import useLegendProcess from "@/hooks/useLegendProcessor";
  import { isDef } from "@/utils/is";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { Themes } from "@/constants/data";

  /*global defineProps, defineEmits */
  const emits = defineEmits(["click"]);
  const props = defineProps({
    data: {
      type: Object as PropType<{ [key: string]: number[] }>,
      default: () => ({}),
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
    config: {
      type: Object as PropType<
        LineConfig & {
          filters?: Filters;
          relatedTrace?: RelatedTrace;
          id?: string;
          associate?: { widgetId: string }[];
        }
      >,
      default: () => ({
        step: false,
        smooth: false,
        showSymbol: false,
        opacity: 0.4,
        showXAxis: true,
        showYAxis: true,
        smallTips: false,
        showlabels: true,
        noTooltips: false,
      }),
    },
  });
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const setRight = ref<boolean>(false);
  const legendSelector = computed(() => props.config.legend?.asSelector);
  const option = computed(() => getOption());
  function getOption() {
    const { showEchartsLegend, isRight, chartColors } = useLegendProcess(props.config.legend);
    setRight.value = isRight;
    const keys = Object.keys(props.data || {}).filter(
      (i: string) => Array.isArray(props.data[i]) && props.data[i].length,
    );
    const temp = keys.map((i: string) => {
      const serie: any = {
        data: props.data[i].map((item: number, itemIndex: number) => [props.intervalTime[itemIndex], item]),
        name: i,
        type: "line",
        symbol: "circle",
        symbolSize: 4,
        showSymbol: isDef(props.config.showSymbol) ? props.config.showSymbol : true,
        step: props.config.step,
        smooth: props.config.smooth,
        lineStyle: {
          width: 2,
          type: "solid",
        },
      };
      if (props.config.type === "Area") {
        serie.areaStyle = {
          opacity: props.config.opacity || 0.4,
        };
      }
      return serie;
    });
    const color: string[] = chartColors();
    const tooltip = {
      trigger: "axis",
      show: !props.config.noTooltips,
      backgroundColor: appStore.theme === Themes.Dark ? "#333" : "#fff",
      borderColor: appStore.theme === Themes.Dark ? "#333" : "#fff",
      textStyle: {
        fontSize: 12,
        color: appStore.theme === Themes.Dark ? "#eee" : "#333",
      },
      enterable: true,
      confine: true,
      extraCssText: "max-width: 100%; max-height: 75%; white-space: normal; overflow: auto;",
    };
    const tips = {
      show: !props.config.noTooltips,
      formatter(params: any) {
        return `${params[0].value[1]}`;
      },
      extraCssText: `height: 20px; padding:0 2px;`,
      trigger: "axis",
      backgroundColor: appStore.theme === Themes.Dark ? "#666" : "#eee",
      borderColor: appStore.theme === Themes.Dark ? "#666" : "#eee",
      textStyle: {
        fontSize: 12,
        color: appStore.theme === Themes.Dark ? "#eee" : "#333",
      },
    };
    const legend =
      appStore.theme === Themes.Dark
        ? {
            pageIconColor: "#ccc",
            pageIconInactiveColor: "#444",
            textStyle: {
              fontSize: 12,
              color: "#eee",
            },
            pageTextStyle: {
              color: "#eee",
            },
          }
        : {
            pageIconColor: "#666",
            pageIconInactiveColor: "#ccc",
            textStyle: {
              fontSize: 12,
              color: "#333",
            },
            pageTextStyle: {
              color: "#333",
            },
          };
    return {
      color,
      tooltip: props.config.smallTips ? tips : tooltip,
      legend: {
        type: "scroll",
        show: showEchartsLegend(keys),
        icon: "circle",
        top: 0,
        left: 0,
        itemWidth: 12,
        data: keys.map((d: string) => ({ name: d })),
        ...legend,
      },
      grid: {
        top: showEchartsLegend(keys) ? 35 : 10,
        left: 0,
        right: 10,
        bottom: 5,
        containLabel: isDef(props.config.showlabels) ? props.config.showlabels : true,
      },
      xAxis: {
        type: "category",
        show: props.config.showXAxis,
        axisTick: {
          lineStyle: { color: "#c1c5ca41" },
          alignWithLabel: true,
        },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: "rgba(0,0,0,0)" } },
        axisLabel: { color: "#9da5b2", fontSize: "11" },
      },
      yAxis: {
        show: props.config.showYAxis,
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#c1c5ca41", type: "dashed" } },
        axisLabel: {
          color: "#9da5b2",
          fontSize: "11",
          show: props.config.showYAxis,
        },
      },
      series: temp,
    };
  }

  function clickEvent(params: EventParams) {
    emits("click", params);
  }
</script>
<style lang="scss" scoped>
  .graph {
    width: 100%;
    height: 100%;
  }
</style>
