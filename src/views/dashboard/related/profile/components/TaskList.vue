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
        <div class="no-data" v-show="!profileStore.taskList.length">
          {{ t("noData") }}
        </div>
        <table class="profile-t">
          <tr class="profile-tr cp" v-for="(i, index) in profileStore.taskList" @click="changeTask(i)" :key="index">
            <td
              class="profile-td"
              :class="{
                selected: profileStore.currentTask && profileStore.currentTask.id === i.id,
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
  <el-dialog v-model="viewDetail" :destroy-on-close="true" fullscreen @closed="viewDetail = false">
    <div class="profile-detail flex-v" v-if="profileStore.currentTask">
      <div>
        <h5 class="mb-10">{{ t("task") }}.</h5>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("service") }}:</span>
          <span class="g-sm-8 wba">{{ service }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("endpoint") }}:</span>
          <span class="g-sm-8 wba">{{ profileStore.currentTask.endpointName }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("monitorTime") }}:</span>
          <span class="g-sm-8 wba">
            {{ dateFormat(profileStore.currentTask.startTime) }}
          </span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("monitorDuration") }}:</span
          ><span class="g-sm-8 wba">{{ profileStore.currentTask.duration }} min</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("minThreshold") }}:</span>
          <span class="g-sm-8 wba"> {{ profileStore.currentTask.minDurationThreshold }} ms </span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("dumpPeriod") }}:</span>
          <span class="g-sm-8 wba">{{ profileStore.currentTask.dumpPeriod }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("maxSamplingCount") }}:</span>
          <span class="g-sm-8 wba">{{ profileStore.currentTask.maxSamplingCount }}</span>
        </div>
      </div>
      <div>
        <h5 class="mb-10 mt-10" v-show="profileStore.currentTask.logs && profileStore.currentTask.logs.length">
          {{ t("logs") }}.
        </h5>
        <div class="log-item" v-for="(i, index) in Object.keys(instanceLogs)" :key="index">
          <div class="mb-10 sm">
            <span class="mr-10 grey">{{ t("instance") }}:</span>
            <span>{{ i }}</span>
          </div>
          <div v-for="(d, index) in instanceLogs[i]" :key="index">
            <span class="mr-10 grey">{{ t("operationType") }}:</span>
            <span class="mr-20">{{ d.operationType }}</span>
            <span class="mr-10 grey">{{ t("time") }}:</span>
            <span>{{ dateFormat(d.operationTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useProfileStore } from "@/store/modules/profile";
  import type { TaskLog, TaskListItem } from "@/types/profile";
  import { ElMessage } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";

  const { t } = useI18n();
  const profileStore = useProfileStore();
  const selectorStore = useSelectorStore();
  const viewDetail = ref<boolean>(false);
  const service = ref<string>("");
  // const selectedTask = ref<TaskListItem | Record<string, never>>({});
  const instanceLogs = ref<TaskLog | any>({});

  async function changeTask(item: TaskListItem) {
    profileStore.setCurrentSegment({});
    profileStore.setCurrentTask(item);
    const res = await profileStore.getSegmentList({ taskID: item.id });
    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  async function viewTask(e: Event, item: TaskListItem) {
    window.event ? (window.event.cancelBubble = true) : e.stopPropagation();
    viewDetail.value = true;
    profileStore.setCurrentTask(item);
    service.value = (selectorStore.services.filter((s: any) => s.id === item.serviceId)[0] || {}).label;
    const res = await profileStore.getTaskLogs({ taskID: item.id });

    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    item.logs = profileStore.taskLogs;
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
    profileStore.setCurrentTask(item);
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
