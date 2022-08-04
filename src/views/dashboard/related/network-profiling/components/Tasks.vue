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
      </div>
      <div class="profile-t-wrapper">
        <div class="no-data" v-show="!ebpfStore.networkTasks.length">
          {{ t("noData") }}
        </div>
        <table class="profile-t">
          <tr
            class="profile-tr cp"
            v-for="(i, index) in ebpfStore.networkTasks"
            @click="changeTask(i)"
            :key="index"
          >
            <td
              class="profile-td"
              :class="{
                selected: ebpfStore.selectedNetworkTask.taskId === i.taskId,
              }"
            >
              <div class="ell">
                <span>
                  {{
                    i.targetType +
                    ": " +
                    (i.processLabels.length
                      ? i.processLabels.join(" ")
                      : `All Processes`)
                  }}
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
  <TaskDetails :details="ebpfStore.selectedNetworkTask" :show="viewDetail" />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { useEbpfStore } from "@/store/modules/ebpf";
import { useSelectorStore } from "@/store/modules/selectors";
import { EBPFTaskList } from "@/types/ebpf";
import { ElMessage } from "element-plus";
import TaskDetails from "./TaskDetails.vue";

const { t } = useI18n();
const selectorStore = useSelectorStore();
const ebpfStore = useEbpfStore();
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);
const viewDetail = ref<boolean>(false);

fetchTasks();

async function changeTask(item: EBPFTaskList) {
  ebpfStore.setSelectedNetworkTask(item);
  const res = await ebpfStore.getEBPFSchedules({
    taskId: item.taskId,
  });
  if (res.errors) {
    ElMessage.error(res.errors);
  }
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
  ebpfStore.createNetworkTask({
    serviceId,
    serviceInstanceId,
  });
}
async function fetchTasks() {
  const serviceId =
    (selectorStore.currentService && selectorStore.currentService.id) || "";
  const serviceInstanceId =
    (selectorStore.currentPod && selectorStore.currentPod.id) || "";
  const res = await ebpfStore.getTaskList({
    serviceId,
    serviceInstanceId,
    targets: ["NETWORK"],
  });

  if (res.errors) {
    ElMessage.error(res.errors);
  }
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
}
</style>
