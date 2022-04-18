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
        <div class="no-data" v-show="!ebpfStore.taskList.length">
          {{ t("noData") }}
        </div>
        <table class="profile-t">
          <tr
            class="profile-tr cp"
            v-for="(i, index) in ebpfStore.taskList"
            @click="changeTask(i)"
            :key="index"
          >
            <td
              class="profile-td"
              :class="{
                selected: selectedTask.id === i.id,
              }"
            >
              <div class="ell">
                <span>{{ i.processLabels.join(" ") }}</span>
                <a class="profile-btn r">
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
</template>
<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { useEbpfStore } from "@/store/modules/ebpf";
import { TaskListItem } from "@/types/profile";
import { ElMessage } from "element-plus";

const { t } = useI18n();
const ebpfStore = useEbpfStore();
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);
const selectedTask = ref<TaskListItem | Record<string, never>>({});

async function changeTask(item: TaskListItem) {
  selectedTask.value = item;
  const res = await ebpfStore.getSegmentList({ taskID: item.id });
  if (res.errors) {
    ElMessage.error(res.errors);
  }
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
  border-right: 1px solid rgba(0, 0, 0, 0.1);
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
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.profile-segment {
  border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.profile-t-tool {
  padding: 5px 10px;
  font-weight: bold;
  border-right: 1px solid rgba(0, 0, 0, 0.07);
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);
  background: #f3f4f9;
}

.log-item {
  margin-top: 20px;
}

.profile-btn {
  color: #3d444f;
  padding: 1px 3px;
  border-radius: 2px;
  font-size: 12px;
  float: right;
}
</style>
