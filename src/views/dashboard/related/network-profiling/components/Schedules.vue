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
  <div ref="timeRange" class="time-ranges"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";

/*global Nullable */
const networkProfilingStore = useNetworkProfilingStore();
const timeRange = ref<Nullable<HTMLDivElement>>(null);
const visGraph = ref<Nullable<any>>(null);
const oldVal = ref<{ width: number; height: number }>({ width: 0, height: 0 });

onMounted(() => {
  oldVal.value = (timeRange.value &&
    timeRange.value.getBoundingClientRect()) || {
    width: 0,
    height: 0,
  };
  visTimeline();
});

function visTimeline() {
  if (!timeRange.value) {
    return;
  }
  if (visGraph.value) {
    visGraph.value.destroy();
  }
  if (!networkProfilingStore.selectedNetworkTask.taskId) {
    return;
  }
  const h = timeRange.value.getBoundingClientRect().height;
  const { taskStartTime, fixedTriggerDuration, name } =
    networkProfilingStore.selectedNetworkTask;
  const startTime =
    fixedTriggerDuration > 1800
      ? taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000
      : taskStartTime;
  const task = [
    {
      id: 1,
      content: name,
      start: new Date(Number(startTime)),
      end: new Date(Number(taskStartTime + fixedTriggerDuration)),
      data: networkProfilingStore.selectedNetworkTask,
      className: networkProfilingStore.selectedNetworkTask.type,
    },
  ];
  const items = new DataSet(task);
  const options: any = {
    height: h,
    width: "100%",
    locale: "en",
    groupHeightMode: "fitItems",
    autoResize: false,
  };
  visGraph.value = new Timeline(timeRange.value, items, options);
}
watch(
  () => networkProfilingStore.selectedNetworkTask,
  () => {
    visTimeline();
  }
);
</script>
<style lang="scss" scoped>
.time-ranges {
  width: calc(100% - 5px);
  padding: 10px;
  height: 150px;
}
</style>
