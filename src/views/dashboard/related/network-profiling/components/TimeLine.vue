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
  <el-popover placement="bottom" :width="600" trigger="click" @after-enter="showTimeLine">
    <template #reference>
      <div class="switch-icon-edit">
        <Icon size="middle" iconName="time_range" />
      </div>
    </template>
    <div ref="timeRange" class="time-ranges"></div>
    <el-button class="query" size="small" type="primary" @click="updateTopology">
      {{ t("query") }}
    </el-button>
  </el-popover>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { DataSet, Timeline } from "vis-timeline/standalone";
  import "vis-timeline/styles/vis-timeline-graph2d.css";
  import dateFormatStep from "@/utils/dateFormat";
  import getLocalTime from "@/utils/localtime";
  import { useAppStoreWithOut } from "@/store/modules/app";

  /*global Nullable, defineEmits */
  const emits = defineEmits(["get"]);
  const { t } = useI18n();
  const selectorStore = useSelectorStore();
  const appStore = useAppStoreWithOut();
  const networkProfilingStore = useNetworkProfilingStore();
  const timeRange = ref<Nullable<HTMLDivElement>>(null);
  const visGraph = ref<Nullable<any>>(null);
  const task = ref<any[]>([]);
  const isUpdate = ref<boolean>(false);

  function showTimeLine() {
    visTimeline();
  }
  function visTimeline() {
    if (!timeRange.value) {
      return;
    }
    if (!networkProfilingStore.selectedNetworkTask.taskId) {
      return;
    }
    const { taskStartTime, fixedTriggerDuration, targetType, taskId } = networkProfilingStore.selectedNetworkTask;
    if (task.value[0] && task.value[0].data.taskId === taskId) {
      if (isUpdate.value) {
        return;
      }
    }
    if (visGraph.value) {
      visGraph.value.destroy();
    }
    isUpdate.value = false;
    let startTime = taskStartTime;
    if (fixedTriggerDuration > 1800) {
      startTime = taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000;
    }
    const d = networkProfilingStore.networkTasks[0] || {};
    let endTime = taskStartTime + fixedTriggerDuration * 1000;
    if (taskStartTime + fixedTriggerDuration * 1000 > new Date().getTime() && taskId === d.taskId) {
      endTime = new Date().getTime();
    }
    task.value = [
      {
        id: 1,
        content: "",
        start: new Date(startTime),
        end: new Date(endTime),
        data: networkProfilingStore.selectedNetworkTask,
        className: targetType,
      },
    ];
    const items: any = new DataSet(task.value);
    items.on("update", (event: string, properties: any) => {
      task.value = properties.data;
    });
    const itemsAlwaysDraggable =
      fixedTriggerDuration > 1800
        ? {
            item: true,
            range: true,
          }
        : undefined;
    const editable =
      fixedTriggerDuration > 1800
        ? {
            updateTime: true,
          }
        : false;
    const options = {
      height: 150,
      width: "100%",
      locale: "en",
      editable,
      zoomMin: 1000 * 60,
      zoomMax: 1000 * 60 * 60 * 24,
    };
    const opt = itemsAlwaysDraggable ? { ...options, itemsAlwaysDraggable } : options;
    visGraph.value = new Timeline(timeRange.value, items, opt);
  }
  async function updateTopology() {
    isUpdate.value = true;
    emits("get", {
      start: task.value[0].start.getTime(),
      end: task.value[0].end.getTime(),
    });
    const serviceInstanceId = (selectorStore.currentPod && selectorStore.currentPod.id) || "";

    const resp = await networkProfilingStore.getProcessTopology({
      serviceInstanceId,
      duration: {
        start: dateFormatStep(getLocalTime(appStore.utc, new Date(task.value[0].start)), appStore.duration.step, true),
        end: dateFormatStep(getLocalTime(appStore.utc, new Date(task.value[0].end)), appStore.duration.step, true),
        step: appStore.duration.step,
      },
    });
    if (resp.errors) {
      ElMessage.error(resp.errors);
    }
    return resp;
  }
</script>
<style lang="scss" scoped>
  .switch-icon-edit {
    cursor: pointer;
    transition: all 0.5ms linear;
    border: 1px solid $disabled-color;
    color: var(--text-color-placeholder);
    display: inline-block;
    padding: 5px;
    border-radius: 3px;
    position: absolute;
    top: 10px;
    right: 50px;
  }
</style>
