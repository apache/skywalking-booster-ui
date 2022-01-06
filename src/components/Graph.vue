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
  <div ref="chart" :style="`height:${height};width:${width};`"></div>
</template>
<script lang="ts" setup>
import {
  onMounted,
  watch,
  reactive,
  ref,
  defineProps,
  onBeforeUnmount,
} from "vue";
import type { PropType } from "vue";
import * as echarts from "echarts";
/*global Nullable*/
const chart = ref<Nullable<HTMLElement>>(null);
const state = reactive<{ instanceChart: any }>({
  instanceChart: null,
});
const props = defineProps({
  clickEvent: { type: Function as PropType<(param: unknown) => void> },
  height: { type: String, default: "100%" },
  width: { type: String, default: "100%" },
  option: {
    type: Object as PropType<{ [key: string]: unknown }>,
    default: () => ({}),
  },
});

onMounted(() => {
  setTimeout(() => {
    console.log(chart.value);
    drawEcharts();
    window.addEventListener("resize", state.instanceChart.resize);
  }, 50);
});
function drawEcharts(): void {
  if (!chart.value) {
    return;
  }
  state.instanceChart = echarts.init(chart.value, "");
  unWarp(state.instanceChart).setOption(props.option);
  state.instanceChart.on("click", (params: any) => {
    if (!props.clickEvent) {
      return;
    }
    props.clickEvent(params);
  });
}
function unWarp(obj: any) {
  return obj && (obj.__v_raw || obj.valueOf() || obj);
}

watch(
  () => props.option,
  (opt) => {
    if (state.instanceChart) {
      state.instanceChart.setOption(opt, true);
    } else {
      drawEcharts();
    }
  }
);
onBeforeUnmount(() => {
  if (state.instanceChart.dispose) {
    state.instanceChart.dispose();
  }
  window.removeEventListener("resize", state.instanceChart.resize);
});
</script>
