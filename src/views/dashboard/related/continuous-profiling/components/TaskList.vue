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
        <div class="no-data" v-show="!continousProfilingStore.taskList.length">
          {{ t("noData") }}
        </div>
        <table class="profile-t">
          <tr
            class="profile-tr cp"
            v-for="(i, index) in continousProfilingStore.taskList"
            @click="changeTask(i)"
            :key="index"
          >
            <td
              class="profile-td"
              :class="{
                selected: continousProfilingStore.selectedTask.taskId === i.taskId,
              }"
            >
              <div class="ell" v-for="(cause, j) in i.continuousProfilingCauses" :key="j">
                <span>
                  {{ `${cause.type}: ${getURI(cause.uri)}${cause.uri.threshold}>=${cause.uri.current}` }}
                </span>
                <!-- <a class="profile-view r" @click="viewDetail = true">
                  <Icon iconName="view" size="middle" />
                </a> -->
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
  <!-- <el-dialog v-model="viewDetail" :destroy-on-close="true" fullscreen @closed="viewDetail = false">
    <TaskDetails :details="continousProfilingStore.selectedTask" />
  </el-dialog> -->
</template>
<script lang="ts" setup>
  // import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import type { EBPFTaskList } from "@/types/ebpf";
  // import TaskDetails from "../../components/TaskDetails.vue";
  import { dateFormat } from "@/utils/dateFormat";

  const { t } = useI18n();
  const continousProfilingStore = useContinousProfilingStore();
  // const viewDetail = ref<boolean>(false);

  async function changeTask(item: EBPFTaskList) {
    continousProfilingStore.setselectedTask(item);
  }

  function getURI(uri: { uriRegex: string; uriPath: string }) {
    return uri ? `(${uri.uriRegex || ""} | ${uri.uriPath || ""})` : "";
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
    padding: 10px;
    font-weight: bold;
    border-right: 1px solid rgba(0, 0, 0, 0.07);
    border-bottom: 1px solid rgba(0, 0, 0, 0.07);
    background: #f3f4f9;
  }

  .profile-view {
    color: #3d444f;
    padding: 1px 3px;
    border-radius: 2px;
    font-size: 12px;
    float: right;
  }
</style>
