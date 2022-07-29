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
  filters: {
    type: Object as PropType<{
      duration: {
        startTime: string;
        endTime: string;
      };
      isRange: boolean;
      dataIndex?: number;
      sourceId: string;
    }>,
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
    instance.on("click", (params: unknown) => {
      emits("select", params);
    });
    document.addEventListener(
      "click",
      () => {
        if (instance.isDisposed()) {
          return;
        }
        instance.dispatchAction({
          type: "hideTip",
        });
        instance.dispatchAction({
          type: "updateAxisPointer",
          currTrigger: "leave",
        });
      },
      true
    );
  }, 1000);
});

function updateOptions() {
  const instance = getInstance();
  if (!instance) {
    return;
  }
  if (!props.filters) {
    return;
  }
  if (props.filters.isRange) {
    const options = eventAssociate();
    setOptions(options || props.option);
  } else {
    instance.dispatchAction({
      type: "showTip",
      dataIndex: props.filters.dataIndex,
      seriesIndex: 0,
    });
  }
}

function eventAssociate() {
  if (!props.filters) {
    return;
  }
  if (!props.filters.duration) {
    return props.option;
  }
  if (!props.option.series[0]) {
    return;
  }
  const list = props.option.series[0].data.map(
    (d: (number | string)[]) => d[0]
  );
  if (!list.includes(props.filters.duration.endTime)) {
    return;
  }
  const markArea = {
    silent: true,
    itemStyle: {
      opacity: 0.3,
    },
    data: [
      [
        {
          xAxis: props.filters.duration.startTime,
        },
        {
          xAxis: props.filters.duration.endTime,
        },
      ],
    ],
  };
  const series = (window as any).structuredClone(props.option.series);
  for (const [key, temp] of series.entries()) {
    if (key === 0) {
      temp.markArea = markArea;
    }
  }
  const options = {
    ...props.option,
    series,
  };
  return options;
}

watch(
  () => props.option,
  (newVal, oldVal) => {
    if (!available.value) {
      return;
    }
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
      return;
    }
    let options;
    if (props.filters && props.filters.isRange) {
      options = eventAssociate();
    }
    setOptions(options || props.option);
  }
);
watch(
  () => props.filters,
  () => {
    updateOptions();
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
