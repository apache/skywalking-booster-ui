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
  <div class="profile-task-list flex-v">
    <div class="profile-task-wrapper flex-v">
      <div class="profile-t-tool flex-h">{{ t("taskList") }}</div>
      <div class="profile-t-wrapper">
        <div class="no-data" v-show="!asyncProfilingStore.taskList.length">
          {{ t("noData") }}
        </div>
        <table class="profile-t">
          <tr
            class="profile-tr cp"
            v-for="(i, index) in asyncProfilingStore.taskList"
            @click="changeTask(i)"
            :key="index"
          >
            <td
              class="profile-td"
              :class="{
                selected: asyncProfilingStore.currentTask && asyncProfilingStore.currentTask.id === i.id,
              }"
            >
              <div class="ell">
                <span>{{ i.endpointName }}</span>
                <a class="profile-btn r" @click="viewTask($event, i)">
                  <Icon iconName="view" size="middle" />
                </a>
              </div>
              <div class="grey ell sm">
                <span class="mr-10 sm">
                  {{ dateFormat(i.startTime) }}
                </span>
                <span class="mr-10 sm">
                  {{ dateFormat(i.startTime + i.duration * 60 * 1000) }}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useAsyncProfilingStore } from "@/store/modules/async-profiling";
  import type { TaskLog, TaskListItem } from "@/types/profile";
  import { ElMessage } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";

  const { t } = useI18n();
  const asyncProfilingStore = useAsyncProfilingStore();
  const selectorStore = useSelectorStore();
  const viewDetail = ref<boolean>(false);
  const service = ref<string>("");
  // const selectedTask = ref<TaskListItem | Record<string, never>>({});
  const instanceLogs = ref<TaskLog | any>({});

  async function changeTask(item: TaskListItem) {
    asyncProfilingStore.setCurrentSegment({});
    asyncProfilingStore.setCurrentTask(item);
    const res = await asyncProfilingStore.getSegmentList({ taskID: item.id });
    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  async function viewTask(e: Event, item: TaskListItem) {
    e.stopPropagation();
    viewDetail.value = true;
    asyncProfilingStore.setCurrentTask(item);
    service.value = (selectorStore.services.filter((s: any) => s.id === item.serviceId)[0] || {}).label;
    const res = await asyncProfilingStore.getTaskLogs({ taskID: item.id });

    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    item.logs = asyncProfilingStore.taskLogs;
    instanceLogs.value = {};
    for (const d of item.logs) {
      if (instanceLogs.value[d.instanceName]) {
        instanceLogs.value[d.instanceName].push({
          operationType: d.operationType,
          operationTime: d.operationTime,
        });
      } else {
        instanceLogs.value[d.instanceName] = [{ operationType: d.operationType, operationTime: d.operationTime }];
      }
    }
    asyncProfilingStore.setCurrentTask(item);
  }
</script>
<style lang="scss" scoped>
  .profile-task-list {
    width: 300px;
    height: calc((100% - 60px) / 2);
    overflow: auto;
  }

  .item span {
    height: 21px;
  }

  .profile-td {
    padding: 5px 10px;
    border-bottom: 1px solid var(--sw-trace-list-border);

    &.selected {
      background-color: var(--sw-list-selected);
    }
  }

  .no-data {
    text-align: center;
    margin-top: 10px;
  }

  .profile-t-wrapper {
    overflow: auto;
    flex-grow: 1;
    border-right: 1px solid var(--sw-trace-list-border);
  }

  .profile-t {
    width: 100%;
    border-spacing: 0;
    table-layout: fixed;
    flex-grow: 1;
    position: relative;
  }

  .profile-tr {
    &:hover {
      background-color: var(--sw-list-hover);
    }
  }

  .profile-segment {
    border-top: 1px solid var(--sw-trace-list-border);
  }

  .profile-t-tool {
    padding: 5px 10px;
    font-weight: bold;
    border-right: 1px solid var(--sw-trace-list-border);
    border-bottom: 1px solid var(--sw-trace-list-border);
    background-color: var(--sw-table-header);
  }

  .log-item {
    margin-top: 20px;
  }

  .profile-btn {
    color: $font-color;
    padding: 1px 3px;
    border-radius: 2px;
    font-size: $font-size-smaller;
    float: right;
  }
</style>
