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
          <tr class="profile-tr cp" v-for="(i, index) in ebpfStore.taskList" @click="changeTask(i)" :key="index">
            <td
              class="profile-td"
              :class="{
                selected: ebpfStore.selectedTask.taskId === i.taskId,
              }"
            >
              <div class="ell">
                <span>
                  {{ i.targetType + ": " + (i.processLabels.length ? i.processLabels.join(" ") : `All Processes`) }}
                </span>
                <a class="profile-btn r" @click="viewDetail = true">
                  <Icon iconName="view" size="middle" />
                </a>
              </div>
              <div class="grey ell sm">
                <span class="mr-10 sm">{{ dateFormat(i.taskStartTime) }}</span>
                <span class="mr-10 sm">
                  {{ dateFormat(i.taskStartTime + i.fixedTriggerDuration * 1000) }}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
  <el-dialog v-model="viewDetail" :destroy-on-close="true" fullscreen @closed="viewDetail = false">
    <TaskDetails :details="ebpfStore.selectedTask" />
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useEbpfStore } from "@/store/modules/ebpf";
  import type { EBPFTaskList } from "@/types/ebpf";
  import { ElMessage } from "element-plus";
  import TaskDetails from "../../components/TaskDetails.vue";
  import { dateFormat } from "@/utils/dateFormat";

  const { t } = useI18n();
  const ebpfStore = useEbpfStore();
  const viewDetail = ref<boolean>(false);

  async function changeTask(item: EBPFTaskList) {
    ebpfStore.setSelectedTask(item);
    const res = await ebpfStore.getEBPFSchedules({
      taskId: item.taskId,
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
    border-right: 1px solid var(--sw-trace-list-border);
  }

  .item span {
    height: 21px;
  }

  .profile-td {
    padding: 5px 10px;
    border-bottom: 1px solid rgb(0 0 0 / 7%);

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
      background-color: var(--sw-list-hover);
    }
  }

  .profile-t-tool {
    padding: 5px 10px;
    font-weight: bold;
    border-right: 1px solid var(--sw-trace-list-border);
    border-bottom: 1px solid var(--sw-trace-list-border);
    background-color: var(--sw-table-header);
  }

  .profile-btn {
    color: $font-color;
    padding: 1px 3px;
    border-radius: 2px;
    font-size: $font-size-smaller;
    float: right;
  }
</style>
