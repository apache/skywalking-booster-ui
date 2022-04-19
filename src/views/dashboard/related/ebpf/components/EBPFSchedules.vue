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
  <div ref="timeline" class="schedules"></div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import dayjs from "dayjs";
import { useEbpfStore } from "@/store/modules/ebpf";
import { EBPFProfilingSchedule } from "@/types/ebpf";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";

const ebpfStore = useEbpfStore();
/*global Nullable */
const timeline = ref<Nullable<HTMLDivElement>>(null);
const visGraph = ref<Nullable<any>>(null);
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);

function visTimeline() {
  if (visGraph.value) {
    visGraph.value.destroy();
  }
  const schedules = ebpfStore.eBPFSchedules.map(
    (d: EBPFProfilingSchedule, index: number) => {
      return {
        id: index + 1,
        content: "schedule" + index,
        start: dateFormat(d.startTime),
        end: dateFormat(d.endTime),
      };
    }
  );
  const items: any = new DataSet(schedules);
  const options = {
    editable: true,
    selectable: true,
  };
  if (!timeline.value) {
    return;
  }
  visGraph.value = new Timeline(timeline.value, items, options);
}

watch(
  () => ebpfStore.eBPFSchedules,
  () => {
    visTimeline();
  }
);
</script>
<style lang="scss" scoped>
.schedules {
  width: 100%;
  height: 400px;
}
</style>
