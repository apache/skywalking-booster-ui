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
  <div class="profile-task-list flex-v" v-loading="asyncProfilingStore.loadingTasks">
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
          :class="{
            selected: asyncProfilingStore.selectedTask.id === i.id,
          }"
        >
          <td class="profile-td">
            <div class="ell">
              <span>{{ i.id }}</span>
              <a class="profile-btn r" @click="() => (showDetail = true)">
                <Icon iconName="view" size="middle" />
              </a>
            </div>
            <div class="grey ell sm">
              <span class="mr-10 sm">
                {{ dateFormat(i.createTime) }}
              </span>
              <span class="mr-10 sm">
                {{ dateFormat(i.createTime + i.duration * 1000) }}
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
  <el-dialog v-model="showDetail" :destroy-on-close="true" fullscreen @closed="showDetail = false">
    <div class="profile-detail flex-v" v-if="asyncProfilingStore.selectedTask.id">
      <div>
        <h5 class="mb-10">{{ t("task") }}.</h5>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">ID:</span>
          <span class="g-sm-8 wba">{{ asyncProfilingStore.selectedTask.id }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("service") }}:</span>
          <span class="g-sm-8 wba">{{ service }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("execArgs") }}:</span>
          <span class="g-sm-8 wba">{{ asyncProfilingStore.selectedTask.execArgs }}</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("duration") }}:</span>
          <span class="g-sm-8 wba">{{ asyncProfilingStore.selectedTask.duration / 60 }}min</span>
        </div>
        <div class="mb-10 clear item">
          <span class="g-sm-4 grey">{{ t("events") }}:</span>
          <span class="g-sm-8 wba"> {{ asyncProfilingStore.selectedTask.events.join(", ") }} </span>
        </div>
      </div>
      <div>
        <h5
          class="mb-5 mt-10"
          v-show="asyncProfilingStore.selectedTask.logs && asyncProfilingStore.selectedTask.logs.length"
        >
          {{ t("logs") }}.
        </h5>
        <div v-for="(i, index) in Object.keys(instanceLogs)" :key="index">
          <div class="sm">
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
      <div>
        <h5 class="mb-10 mt-10" v-show="errorInstances.length"> {{ t("errorInstances") }}</h5>
        <div v-for="(instance, index) in errorInstances" :key="instance.value || index">
          <div class="mb-10 sm">
            <span class="mr-10 grey">{{ t("instance") }}:</span>
            <span>{{ instance.label }}</span>
          </div>
          <div v-for="(d, index) in instance.attributes" :key="d.value + index">
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
          <div v-for="(d, index) in instance.attributes" :key="d.value + index">
            <span class="mr-10 grey">{{ d.name }}:</span>
            <span class="mr-20">{{ d.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useAsyncProfilingStore } from "@/store/modules/async-profiling";
  import type { TaskLog, TaskListItem } from "@/types/profile";
  import { ElMessage } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";
  import type { Instance, Service } from "@/types/selector";

  const { t } = useI18n();
  const asyncProfilingStore = useAsyncProfilingStore();
  const selectorStore = useSelectorStore();
  const showDetail = ref<boolean>(false);
  const service = ref<string>("");
  const instanceLogs = ref<TaskLog | any>({});
  const errorInstances = ref<Instance[]>([]);
  const successInstances = ref<Instance[]>([]);

  onMounted(() => {
    fetchTasks();
  });

  async function fetchTasks() {
    const res = await asyncProfilingStore.getTaskList();
    if (res.errors) {
      return ElMessage.error(res.errors);
    }
    if (res.data.errorReason) {
      ElMessage.error(res.errors);
    }
  }

  async function changeTask(item: TaskListItem) {
    if (item.id !== asyncProfilingStore.selectedTask.id) {
      asyncProfilingStore.setAnalyzeTrees([]);
      asyncProfilingStore.setSelectedTask(item);
    }
    service.value = (selectorStore.services.filter((s: Service) => s.id === item.serviceId)[0] ?? {}).label;
    const res = await asyncProfilingStore.getTaskLogs({ taskId: item.id });

    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    item = {
      ...item,
      ...asyncProfilingStore.taskProgress,
    };
    asyncProfilingStore.setSelectedTask(item);
    errorInstances.value = asyncProfilingStore.instances.filter(
      (d: Instance) => d.id && item.errorInstanceIds.includes(d.id),
    );
    successInstances.value = asyncProfilingStore.instances.filter(
      (d: Instance) => d.id && item.successInstanceIds.includes(d.id),
    );
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

  .profile-btn {
    color: $font-color;
    padding: 1px 3px;
    border-radius: 2px;
    font-size: $font-size-smaller;
    float: right;
  }
</style>
