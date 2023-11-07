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
  <div class="flex-h header">
    <div class="title">eBPF Profiling</div>
    <el-button type="primary" size="small" @click="createTask">
      {{ t("newTask") }}
    </el-button>
  </div>
  <el-dialog v-model="newTask" :destroy-on-close="true" fullscreen @closed="newTask = false">
    <NewTask @close="newTask = false" />
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useEbpfStore } from "@/store/modules/ebpf";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import NewTask from "./components/NewTask.vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { EntityType } from "../../data";
  import { EBPFProfilingTriggerType } from "@/store/data";

  /*global defineProps */
  const props = defineProps({
    needQuery: { type: Boolean, default: true },
  });
  const ebpfStore = useEbpfStore();
  const appStore = useAppStoreWithOut();
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const { t } = useI18n();
  const newTask = ref<boolean>(false);

  if (props.needQuery) {
    searchTasks();
  }

  async function searchTasks() {
    const serviceId = (selectorStore.currentService && selectorStore.currentService.id) || "";
    const res = await ebpfStore.getTaskList({
      serviceId,
      targets: ["ON_CPU", "OFF_CPU"],
      triggerType: EBPFProfilingTriggerType.FIXED_TIME,
    });

    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  async function createTask() {
    if (!selectorStore.currentService) {
      return;
    }
    newTask.value = true;
    ebpfStore.getCreateTaskData(selectorStore.currentService.id);
  }

  watch(
    () => selectorStore.currentService,
    () => {
      searchTasks();
    },
  );
  watch(
    () => appStore.durationTime,
    () => {
      if (dashboardStore.entity === EntityType[1].value) {
        searchTasks();
      }
    },
  );
</script>
<style lang="scss" scoped>
  .header {
    padding: 5px 20px 5px 10px;
    font-size: $font-size-smaller;
    border-bottom: 1px solid $border-color;
    justify-content: space-between;
  }

  .name {
    width: 270px;
  }

  .new-btn {
    float: right;
  }

  .title {
    font-weight: bold;
    line-height: 24px;
  }
</style>
