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
  <div ref="timeline" class="task-timeline"></div>
</template>
<script lang="ts" setup>
  import { ref, watch, onMounted, onUnmounted } from "vue";
  import dayjs from "dayjs";
  import { useThrottleFn } from "@vueuse/core";
  import { ElMessage } from "element-plus";
  import type { EBPFTaskList } from "@/types/ebpf";
  import { useTaskTimelineStore } from "@/store/modules/task-timeline";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import { DataSet, Timeline } from "vis-timeline/standalone";
  import "vis-timeline/styles/vis-timeline-graph2d.css";
  import { EBPFProfilingTriggerType } from "@/store/data";

  const taskTimelineStore = useTaskTimelineStore();
  const selectorStore = useSelectorStore();
  const continousProfilingStore = useContinousProfilingStore();
  const dashboardStore = useDashboardStore();
  /* global defineProps, Nullable */
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
  });
  const timeline = ref<Nullable<HTMLDivElement>>(null);
  const visGraph = ref<Nullable<any>>(null);
  const oldVal = ref<{ width: number; height: number }>({ width: 0, height: 0 });
  const visDate = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") => dayjs(date).format(pattern);

  init();
  onMounted(() => {
    oldVal.value = (timeline.value && timeline.value.getBoundingClientRect()) || {
      width: 0,
      height: 0,
    };
    useThrottleFn(resize, 500)();
  });

  async function init() {
    const serviceId = (selectorStore.currentService && selectorStore.currentService.id) || "";
    const serviceInstanceId = (selectorStore.currentPod && selectorStore.currentPod.id) || "";
    const type = continousProfilingStore.selectedStrategy.type;
    const res = await taskTimelineStore.getContinousTaskList({
      serviceId,
      serviceInstanceId,
      targets: type ? [type] : null,
      triggerType: EBPFProfilingTriggerType.CONTINUOUS_PROFILING,
    });
    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    visTimeline();
  }

  function visTimeline() {
    if (!timeline.value) {
      return;
    }
    if (visGraph.value) {
      visGraph.value.destroy();
    }
    const h = timeline.value.getBoundingClientRect().height;
    const taskList = taskTimelineStore.taskList.map((d: EBPFTaskList, index: number) => {
      return {
        id: index,
        // content: d.targetType,
        start: new Date(Number(d.taskStartTime)),
        end: new Date(Number(d.taskStartTime + d.fixedTriggerDuration * 1000)),
        data: d,
        className: d.targetType,
      };
    });
    const items: any = new DataSet(taskList);
    const options: any = {
      height: h,
      width: "100%",
      locale: "en",
      groupHeightMode: "fitItems",
      autoResize: false,
      tooltip: {
        overflowMethod: "cap",
        template(item: EBPFTaskList | any) {
          const data = item.data || {};
          const end = data.taskStartTime ? visDate(data.taskStartTime + data.fixedTriggerDuration * 1000) : "";
          let str = "";
          for (const item of data.continuousProfilingCauses || []) {
            str += `${item.message};`;
          }
          let tmp = `
          <div>Task ID: ${data.taskId || ""}</div>
          <div>Target Type: ${data.targetType || ""}</div>
          <div>Trigger Type: ${data.triggerType || ""}</div>
          <div>Start Time: ${data.taskStartTime ? visDate(data.taskStartTime) : ""}</div>
          <div>End Time: ${end}</div>
          <div>Causes: ${str}</div>
          <div>Process Labels: ${data.processLabels.join("; ") || ""}</div>`;
          return tmp;
        },
      },
    };
    visGraph.value = new Timeline(timeline.value, items, options);
    visGraph.value.on("select", async (properties: { items: number[] }) => {
      dashboardStore.selectWidget(props.data);
      const index = properties.items[0];
      const task = taskTimelineStore.taskList[index];

      await taskTimelineStore.setSelectedTask(task);
      await taskTimelineStore.getGraphData();
    });
  }

  function resize() {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const cr = entry.contentRect;
      if (Math.abs(cr.width - oldVal.value.width) < 3 && Math.abs(cr.height - oldVal.value.height) < 3) {
        return;
      }
      visTimeline();
      oldVal.value = { width: cr.width, height: cr.height };
    });
    if (timeline.value) {
      observer.observe(timeline.value);
    }
  }
  onUnmounted(() => {
    if (visGraph.value) {
      visGraph.value.destroy();
    }
    taskTimelineStore.setTaskList([]);
  });
  watch(
    () => selectorStore.currentProcess,
    () => {
      init();
    },
  );
</script>
<style lang="scss" scoped>
  .task-timeline {
    width: calc(100% - 5px);
    margin: 0 5px 5px 0;
    height: 200px;
  }

  .message {
    max-width: 400px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
