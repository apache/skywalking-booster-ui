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
        <span v-if="inProcess" class="new-task cp" @click="createTask">
          <Icon
            :style="{ color: '#ccc' }"
            iconName="library_add"
            size="middle"
          />
        </span>
        <el-popconfirm
          title="Are you sure to create a task?"
          @confirm="createTask"
          v-else
        >
          <template #reference>
            <span class="new-task cp">
              <Icon iconName="library_add" size="middle" />
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
                <span class="mr-10 sm">
                  {{ dateFormat(i.taskStartTime) }}
                </span>
                <span class="mr-10 sm">
                  {{
                    dateFormat(i.taskStartTime + i.fixedTriggerDuration * 1000)
                  }}
                </span>
                <span class="new-task" @click="viewDetail = true">
                  <Icon iconName="view" size="middle" />
                </span>
                <span class="reload" v-if="index === 0 && inProcess">
                  <Icon iconName="retry" :loading="true" size="middle" />
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
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
import { useSelectorStore } from "@/store/modules/selectors";
import { EBPFTaskList } from "@/types/ebpf";
import { ElMessage } from "element-plus";
import TaskDetails from "../../components/TaskDetails.vue";
import dateFormatStep, { dateFormat } from "@/utils/dateFormat";
import getLocalTime from "@/utils/localtime";
import { useAppStoreWithOut } from "@/store/modules/app";

const { t } = useI18n();
const selectorStore = useSelectorStore();
const networkProfilingStore = useNetworkProfilingStore();
const appStore = useAppStoreWithOut();
const viewDetail = ref<boolean>(false);
/*global Nullable */
const intervalFn = ref<Nullable<any>>(null);
const intervalKeepAlive = ref<Nullable<any>>(null);
const inProcess = ref<boolean>(false);

fetchTasks();

async function changeTask(item: EBPFTaskList) {
  networkProfilingStore.setSelectedNetworkTask(item);
  intervalFn.value && clearInterval(intervalFn.value);
  getTopology();
}
async function getTopology() {
  const { taskStartTime, fixedTriggerDuration, taskId } =
    networkProfilingStore.selectedNetworkTask;
  const serviceInstanceId =
    (selectorStore.currentPod && selectorStore.currentPod.id) || "";
  const startTime =
    fixedTriggerDuration > 1800
      ? taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000
      : taskStartTime;
  let endTime = taskStartTime + fixedTriggerDuration * 1000;
  if (taskStartTime + fixedTriggerDuration * 1000 > new Date().getTime()) {
    endTime = new Date().getTime();
  }
  const resp = await networkProfilingStore.getProcessTopology({
    serviceInstanceId,
    duration: {
      start: dateFormatStep(
        getLocalTime(appStore.utc, new Date(startTime)),
        appStore.duration.step,
        true
      ),
      end: dateFormatStep(
        getLocalTime(appStore.utc, new Date(endTime)),
        appStore.duration.step,
        true
      ),
      step: appStore.duration.step,
    },
  });
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
  const task = networkProfilingStore.networkTasks[0] || {};
  if (task.taskId === taskId) {
    inProcess.value =
      task.taskStartTime + task.fixedTriggerDuration * 1000 >
      new Date().getTime()
        ? true
        : false;
  }
  if (!inProcess.value) {
    intervalFn.value && clearInterval(intervalFn.value);
    intervalKeepAlive.value && clearInterval(intervalKeepAlive.value);
  }
  return resp;
}
async function createTask() {
  if (inProcess.value) {
    return;
  }
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
  const res = await networkProfilingStore.createNetworkTask({
    serviceId,
    serviceInstanceId,
  });
  if (res.errors) {
    ElMessage.error(res.errors);
    return;
  }
  await fetchTasks();
}
function enableInterval() {
  intervalFn.value = setInterval(getTopology, 30000);
}

function networkInterval() {
  intervalKeepAlive.value = setInterval(keepAliveNetwork, 60000);
}

async function keepAliveNetwork() {
  const res = await networkProfilingStore.keepNetworkProfiling(
    networkProfilingStore.selectedNetworkTask.taskId
  );
  if (res.errors) {
    intervalKeepAlive.value && clearInterval(intervalKeepAlive.value);
    return ElMessage.error(res.errors);
  }
  if (!networkProfilingStore.aliveNetwork) {
    intervalFn.value && clearInterval(intervalFn.value);
    intervalKeepAlive.value && clearInterval(intervalKeepAlive.value);
  }
}

async function fetchTasks() {
  intervalFn.value && clearInterval(intervalFn.value);
  intervalKeepAlive.value && clearInterval(intervalKeepAlive.value);
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
  if (!networkProfilingStore.networkTasks.length) {
    return;
  }
  await getTopology();
  if (inProcess.value) {
    enableInterval();
    networkInterval();
    keepAliveNetwork();
  }
}

watch(
  () => selectorStore.currentPod,
  () => {
    fetchTasks();
  }
);
</script>
<style lang="scss" scoped>
.profile-task-list {
  width: 330px;
  height: calc(100% - 10px);
  overflow: auto;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.item span {
  height: 21px;
}

.profile-td {
  padding: 10px 5px 10px 10px;
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
  padding: 10px 5px 10px 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: #f3f4f9;
  width: 100%;
}

.new-task {
  float: right;
}

.reload {
  margin-left: 30px;
}
</style>
