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
  <el-button type="primary" size="small">
    {{ t("start") }}
  </el-button>
  <div ref="timeRange" class="time-ranges"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import { useThrottleFn } from "@vueuse/core";

/*global Nullable */
const { t } = useI18n();
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
  useThrottleFn(resize, 500)();
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
  const task = [
    {
      id: 1,
      content: networkProfilingStore.selectedNetworkTask.name,
      start: new Date(
        Number(networkProfilingStore.selectedNetworkTask.taskStartTime)
      ),
      end: new Date(
        Number(
          networkProfilingStore.selectedNetworkTask.taskStartTime +
            networkProfilingStore.selectedNetworkTask.fixedTriggerDuration
        )
      ),
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
function resize() {
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const cr = entry.contentRect;
    if (
      Math.abs(cr.width - oldVal.value.width) < 3 &&
      Math.abs(cr.height - oldVal.value.height) < 3
    ) {
      return;
    }
    visTimeline();
    oldVal.value = { width: cr.width, height: cr.height };
  });
  if (timeRange.value) {
    observer.observe(timeRange.value);
  }
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
  margin: 0 5px 5px 0;
  height: 150px;
}
</style>
