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
  <div class="ebpf-task" v-if="eBPFStore.couldProfiling">
    <div>
      <div class="label">{{ t("labels") }}</div>
      <Selector
        class="profile-input"
        size="small"
        :value="labels"
        :options="eBPFStore.labels"
        placeholder="Select labels"
        :multiple="true"
        @change="changeLabel"
      />
    </div>
    <div>
      <div class="label">{{ t("targetType") }}</div>
      <Selector
        class="profile-input"
        size="small"
        :value="type"
        :options="TargetTypes"
        placeholder="Select a type"
        :isRemote="true"
        @change="changeType"
      />
    </div>
    <div>
      <div class="label">{{ t("monitorTime") }}</div>
      <div>
        <Radio :value="monitorTime" :options="InitTaskField.monitorTimeEn" @change="changeMonitorTime" />
        <span class="date">
          <TimePicker :value="time" position="bottom" format="YYYY-MM-DD HH:mm:ss" @input="changeTimeRange" />
        </span>
      </div>
    </div>
    <div>
      <div class="label">{{ t("monitorDuration") }}</div>
      <el-input
        class="profile-input"
        v-model="monitorDuration"
        size="small"
        placeholder="none"
        type="number"
        :min="1"
        :max="60"
      />
      Min
    </div>
    <div>
      <el-button @click="createTask" type="primary" class="create-task-btn">
        {{ t("createTask") }}
      </el-button>
    </div>
  </div>
  <div v-else>{{ t("ebpfTip") }}</div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useEbpfStore } from "@/store/modules/ebpf";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { ElMessage } from "element-plus";
  import { InitTaskField, TargetTypes } from "./data";

  /* global defineEmits */
  const emits = defineEmits(["close"]);
  const eBPFStore = useEbpfStore();
  const selectorStore = useSelectorStore();
  const appStore = useAppStoreWithOut();
  const { t } = useI18n();
  const labels = ref<string[]>([]);
  const type = ref<string>(TargetTypes[0].value);
  const monitorTime = ref<string>(InitTaskField.monitorTimeEn[0].value);
  const monitorDuration = ref<number>(10);
  const time = ref<Date>(appStore.durationRow.start);
  const disabled = ref<boolean>(false);

  function changeMonitorTime(opt: string) {
    monitorTime.value = opt;
  }

  function changeLabel(opt: any[]) {
    labels.value = opt.map((d) => d.value);
  }

  function changeType(opt: any[]) {
    type.value = opt[0].value;
  }

  async function createTask() {
    if (disabled.value) {
      return;
    }
    disabled.value = true;
    const date = monitorTime.value === "0" ? new Date() : time.value;
    const params = {
      serviceId: selectorStore.currentService.id,
      processLabels: labels.value,
      startTime: date.getTime(),
      duration: monitorDuration.value * 60,
      targetType: type.value,
    };
    const res = await eBPFStore.createTask(params);
    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    disabled.value = false;
    if (!res.data.createTaskData.status) {
      ElMessage.error(res.data.createTaskData.errorReason);
      return;
    }
    ElMessage.success("Task created successfully");
    emits("close");
  }
  function changeTimeRange(val: Date) {
    time.value = val;
  }
</script>
<style lang="scss" scoped>
  .ebpf-task {
    margin: 0 auto;
    width: 400px;
  }

  .date {
    font-size: $font-size-smaller;
  }

  .label {
    margin-top: 10px;
    font-size: $font-size-normal;
  }

  .profile-input {
    width: 300px;
  }

  .create-task-btn {
    width: 300px;
    margin-top: 50px;
  }
</style>
