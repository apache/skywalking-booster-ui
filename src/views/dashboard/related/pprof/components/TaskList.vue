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
  <div class="profile-task-list flex-v" v-loading="pprofStore.loadingTasks">
    <div class="profile-t-tool flex-h">{{ t("taskList") }}</div>
    <div class="profile-t-wrapper">
      <div class="no-data" v-show="!pprofStore.taskList.length">
        {{ t("noData") }}
      </div>
      <table class="profile-t">
        <tr
          class="profile-tr cp"
          v-for="(i, index) in pprofStore.taskList"
          @click="changeTask(i)"
          :key="index"
          :class="{
            selected: pprofStore.selectedTask?.id === i.id,
          }"
        >
          <td class="profile-td">
            <div class="ell">
              <span>{{ i.id }}</span>
              <a class="profile-btn r" @click="() => (showDetail = true)">
                <Icon iconName="view" size="middle" />
              </a>
            </div>
            <div class="grey ell sm task-info">
              <span class="mr-10 sm">
                {{ dateFormat(i.createTime) }}
              </span>
              <span class="task-type">{{ i.events }}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <el-dialog v-model="showDetail" :destroy-on-close="true" fullscreen @closed="showDetail = false">
    <div class="profile-detail flex-v" v-if="pprofStore.selectedTask?.id">
      <div>
        <h5 class="mb-10">{{ t("task") }}.</h5>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">ID:</span>
          <span class="g-sm-8 wba">{{ pprofStore.selectedTask.id }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("service") }}:</span>
          <span class="g-sm-8 wba">{{ service }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("events") }}:</span>
          <span class="g-sm-8 wba">{{ pprofStore.selectedTask.events }}</span>
        </div>
        <div class="mb-10 clear item" v-if="pprofStore.selectedTask.duration !== undefined">
          <span class="g-sm-4 grey">{{ t("duration") }}:</span>
          <span class="g-sm-8 wba">{{ pprofStore.selectedTask.duration }}{{ t("minutes") }}</span>
        </div>
        <div class="mb-10 clear item" v-if="pprofStore.selectedTask.dumpPeriod !== undefined">
          <span class="g-sm-4 grey">{{ t("pprofDumpPeriod") }}:</span>
          <span class="g-sm-8 wba">{{ pprofStore.selectedTask.dumpPeriod }}</span>
        </div>
      </div>
      <div>
        <h5 class="mb-5 mt-10" v-show="pprofStore.selectedTask?.logs?.length"> {{ t("logs") }}. </h5>
        <div v-for="(i, index) in Object.keys(instanceLogs)" :key="index">
          <div class="sm">
            <span class="mr-10 grey">{{ t("instance") }}:</span>
            <span>{{ i }}</span>
          </div>
          <div v-for="(d, logIndex) in instanceLogs[i]" :key="`${d.instanceId}-${logIndex}`">
            <span class="mr-10 grey">{{ t("operationType") }}:</span>
            <span class="mr-20">{{ d.operationType }}</span>
            <span class="mr-10 grey">{{ t("time") }}:</span>
            <span>{{ dateFormat(d.operationTime) }}</span>
          </div>
        </div>
      </div>
      <div>
        <h5 class="mb-10 mt-10" v-show="errorInstances.length"> {{ t("errorInstances") }}</h5>
        <div v-for="(instance, index) in errorInstances" :key="instance.value || index">
          <div class="mb-10 sm">
            <span class="mr-10 grey">{{ t("instance") }}:</span>
            <span>{{ instance.label }}</span>
          </div>
          <div v-for="(d, attrIndex) in instance.attributes" :key="d.value + attrIndex">
            <span class="mr-10 grey">{{ d.name }}:</span>
            <span class="mr-20">{{ d.value }}</span>
          </div>
        </div>
      </div>
      <div>
        <h5 class="mb-10 mt-10" v-show="successInstances.length"> {{ t("successInstances") }}</h5>
        <div v-for="(instance, index) in successInstances" :key="instance.value || index">
          <div class="mb-10 sm">
            <span class="mr-10 grey">{{ t("instance") }}:</span>
            <span>{{ instance.label }}</span>
          </div>
          <div v-for="(d, attrIndex) in instance.attributes" :key="d.value + attrIndex">
            <span class="mr-10 grey">{{ d.name }}:</span>
            <span class="mr-20">{{ d.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref, onMounted, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { usePprofStore } from "@/store/modules/pprof";
  import type { TaskLog } from "@/types/profile";
  import type { PprofTask } from "@/types/pprof";
  import { ElMessage } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";
  import type { Instance, Service } from "@/types/selector";

  /*global Nullable*/
  const { t } = useI18n();
  const pprofStore = usePprofStore();
  const selectorStore = useSelectorStore();
  const showDetail = ref<boolean>(false);
  const service = ref<string>("");
  const instanceLogs = ref<Record<string, TaskLog[]>>({});
  const errorInstances = ref<Instance[]>([]);
  const successInstances = ref<Instance[]>([]);

  onMounted(() => {
    fetchTasks();
  });

  watch(
    () => pprofStore.instances,
    () => {
      syncTaskDetails(pprofStore.selectedTask);
    },
    { deep: true },
  );

  async function fetchTasks() {
    const res = await pprofStore.getTaskList();
    if (res?.errors) {
      ElMessage.error(res.errors);
      return;
    }
    const errorReason = res?.data?.pprofTaskList?.errorReason;
    if (errorReason) {
      ElMessage.error(errorReason);
      return;
    }
    if (pprofStore.selectedTask?.id) {
      await changeTask(pprofStore.selectedTask as PprofTask);
    }
  }

  function syncTaskDetails(item?: Nullable<PprofTask>) {
    if (!item?.id) {
      instanceLogs.value = {};
      errorInstances.value = [];
      successInstances.value = [];
      return;
    }
    errorInstances.value = pprofStore.instances.filter((d: Instance) =>
      d.id ? (item.errorInstanceIds || []).includes(d.id) : false,
    );
    successInstances.value = pprofStore.instances.filter((d: Instance) =>
      d.id ? (item.successInstanceIds || []).includes(d.id) : false,
    );
    instanceLogs.value = {};
    for (const d of item.logs || []) {
      if (instanceLogs.value[d.instanceName]) {
        instanceLogs.value[d.instanceName].push(d);
      } else {
        instanceLogs.value[d.instanceName] = [d];
      }
    }
  }

  async function changeTask(item: PprofTask) {
    if (item.id !== pprofStore.selectedTask?.id) {
      pprofStore.setAnalyzeTrees([]);
      pprofStore.setSelectedTask(item);
    }
    service.value = (selectorStore.services.find((s: Service) => s.id === item.serviceId) || {}).label || "";
    const res = await pprofStore.getTaskLogs({ taskId: item.id });
    if (res?.errors) {
      ElMessage.error(res.errors);
      return;
    }
    const selectedTask = {
      ...item,
      ...pprofStore.taskProgress,
    };
    pprofStore.setSelectedTask(selectedTask);
    syncTaskDetails(selectedTask);
  }
</script>
<style lang="scss" scoped>
  .profile-task-list {
    width: 300px;
    height: calc(100% - 20px);
    overflow: auto;
    border-right: 1px solid var(--sw-trace-list-border);
  }

  .item span {
    height: 21px;
  }

  .profile-td {
    padding: 5px 10px;
    border-bottom: 1px solid var(--sw-trace-list-border);
  }

  .selected {
    background-color: var(--sw-list-selected);
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
  }

  .profile-tr {
    &:hover {
      background-color: var(--sw-list-selected);
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

  .task-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .task-type {
    color: var(--sw-profile-task-type);
    background-color: var(--sw-list-selected);
    padding: 1px 6px;
    border-radius: 3px;
    font-size: $font-size-smaller;
  }
</style>
