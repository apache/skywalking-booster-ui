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
  <div class="chart" ref="chartRef" :style="`height:${height};width:${width};`">
    <div v-if="!available" class="no-data">No Data</div>
  </div>
</template>
<script lang="ts" setup>
import {
  watch,
  ref,
  Ref,
  onMounted,
  onBeforeUnmount,
  unref,
  computed,
} from "vue";
import type { PropType } from "vue";
import { useECharts } from "@/hooks/useEcharts";
import { addResizeListener, removeResizeListener } from "@/utils/event";

/*global Nullable, defineProps, defineEmits*/
const emits = defineEmits(["select"]);
const chartRef = ref<Nullable<HTMLDivElement>>(null);
const { setOptions, resize, getInstance } = useECharts(
  chartRef as Ref<HTMLDivElement>
);
const props = defineProps({
  height: { type: String, default: "100%" },
  width: { type: String, default: "100%" },
  option: {
    type: Object as PropType<{ [key: string]: any }>,
    default: () => ({}),
  },
});
const available = computed(
  () =>
    (Array.isArray(props.option.series) &&
      props.option.series[0] &&
      props.option.series[0].data) ||
    (Array.isArray(props.option.series.data) && props.option.series.data[0])
);
onMounted(async () => {
  await setOptions(props.option);
  chartRef.value && addResizeListener(unref(chartRef), resize);
  setTimeout(() => {
    const instance = getInstance();

    if (!instance) {
      return;
    }
    instance.on("click", (params: any) => {
      emits("select", params);
    });
  }, 1000);
});

watch(
  () => props.option,
  (newVal, oldVal) => {
    if (!available.value) {
      return;
    }
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
      return;
    }
    setOptions(newVal);
  }
);

onBeforeUnmount(() => {
  removeResizeListener(unref(chartRef), resize);
});
</script>
<style lang="scss" scoped>
.no-data {
  font-size: 12px;
  height: 100%;
  box-sizing: border-box;
  display: -webkit-box;
  -webkit-box-orient: horizontal;
  -webkit-box-pack: center;
  -webkit-box-align: center;
  color: #666;
}

.chart {
  overflow: hidden;
}
</style>
