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
      <div class="profile-t-tool">
        <span>{{ t("taskList") }}</span>
        <el-popconfirm
          title="Are you sure to create a task?"
          @confirm="createTask"
        >
          <template #reference>
            <span class="new-task cp">
              <Icon iconName="library_add" size="middle" />
            </span>
          </template>
        </el-popconfirm>
        <el-popconfirm
          :title="`Are you sure to ${
            enableTasks ? 'disable' : 'enable'
          } interval?`"
          @confirm="enableInterval"
        >
          <template #reference>
            <span class="new-task cp">
              <Icon iconName="retry" :loading="enableTasks" size="middle" />
            </span>
          </template>
        </el-popconfirm>
      </div>
      <div class="profile-t-wrapper">
        <div
          class="no-data"
          v-show="!networkProfilingStore.networkTasks.length"
        >
          {{ t("noData") }}
        </div>
        <table class="profile-t">
          <tr
            class="profile-tr cp"
            v-for="(i, index) in networkProfilingStore.networkTasks"
            @click="changeTask(i)"
            :key="index"
          >
            <td
              class="profile-td"
              :class="{
                selected:
                  networkProfilingStore.selectedNetworkTask.taskId === i.taskId,
              }"
            >
              <div class="ell">
                <span>
                  {{ i.targetType }}
                </span>
                <a class="profile-btn r" @click="viewDetail = true">
                  <Icon iconName="view" size="middle" />
                </a>
              </div>
              <div class="grey ell sm">
                <span class="mr-10 sm">{{ dateFormat(i.taskStartTime) }}</span>
                <span class="mr-10 sm">
                  {{
                    dateFormat(i.taskStartTime + i.fixedTriggerDuration * 1000)
                  }}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="viewDetail"
    :destroy-on-close="true"
    fullscreen
    @closed="viewDetail = false"
  >
    <TaskDetails :details="networkProfilingStore.selectedNetworkTask" />
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import { useSelectorStore } from "@/store/modules/selectors";
import { EBPFTaskList } from "@/types/ebpf";
import { ElMessage } from "element-plus";
import TaskDetails from "../../components/TaskDetails.vue";
import dateFormatStep from "@/utils/dateFormat";
import getLocalTime from "@/utils/localtime";
import { useAppStoreWithOut } from "@/store/modules/app";

const { t } = useI18n();
const selectorStore = useSelectorStore();
const networkProfilingStore = useNetworkProfilingStore();
const appStore = useAppStoreWithOut();
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);
const viewDetail = ref<boolean>(false);
const enableTasks = ref<boolean>(false);

fetchTasks();

async function changeTask(item: EBPFTaskList) {
  networkProfilingStore.setSelectedNetworkTask(item);
  getTopology();
}
async function getTopology() {
  const { taskStartTime, fixedTriggerDuration } =
    networkProfilingStore.selectedNetworkTask;
  const serviceInstanceId =
    (selectorStore.currentPod && selectorStore.currentPod.id) || "";
  const startTime =
    fixedTriggerDuration > 1800
      ? taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000
      : taskStartTime;

  const resp = await networkProfilingStore.getProcessTopology({
    serviceInstanceId,
    duration: {
      start: dateFormatStep(
        getLocalTime(appStore.utc, new Date(startTime)),
        appStore.duration.step,
        true
      ),
      end: dateFormatStep(
        getLocalTime(
          appStore.utc,
          new Date(taskStartTime + fixedTriggerDuration * 1000)
        ),
        appStore.duration.step,
        true
      ),
      step: appStore.duration.step,
    },
  });
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
  return resp;
}
async function createTask() {
  const serviceId =
    (selectorStore.currentService && selectorStore.currentService.id) || "";
  const serviceInstanceId =
    (selectorStore.currentPod && selectorStore.currentPod.id) || "";
  if (!serviceId) {
    return;
  }
  if (!serviceInstanceId) {
    return;
  }
  networkProfilingStore.createNetworkTask({
    serviceId,
    serviceInstanceId,
  });
}
function enableInterval() {
  let interval;
  enableTasks.value = !enableTasks.value;
  if (enableTasks.value) {
    interval = setInterval(() => {
      fetchTasks();
    }, 18000);
    return;
  }
  interval && clearInterval(interval);
}
async function fetchTasks() {
  const serviceId =
    (selectorStore.currentService && selectorStore.currentService.id) || "";
  const serviceInstanceId =
    (selectorStore.currentPod && selectorStore.currentPod.id) || "";
  const res = await networkProfilingStore.getTaskList({
    serviceId,
    serviceInstanceId,
    targets: ["NETWORK"],
  });

  if (res.errors) {
    return ElMessage.error(res.errors);
  }
  if (enableTasks.value && !networkProfilingStore.aliveNetwork) {
    return;
  }
  getTopology();
}
</script>
<style lang="scss" scoped>
.profile-task-list {
  width: 300px;
  height: calc(100% - 10px);
  overflow: auto;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.item span {
  height: 21px;
}

.profile-td {
  padding: 5px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);

  &.selected {
    background-color: #ededed;
  }
}

.no-data {
  text-align: center;
  margin-top: 10px;
}

.profile-t-wrapper {
  overflow: auto;
  flex-grow: 1;
}

.profile-t {
  width: 100%;
  border-spacing: 0;
  table-layout: fixed;
  flex-grow: 1;
  position: relative;
  border: none;
}

.profile-tr {
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.profile-t-tool {
  padding: 5px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: #f3f4f9;
  width: 100%;
}

.profile-btn {
  color: #3d444f;
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 12px;
  float: right;
}

.new-task {
  float: right;
  margin-right: 3px;
}
</style>
