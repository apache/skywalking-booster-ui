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
  <div class="pprof-task">
    <div>
      <div class="label">{{ t("instance") }}</div>
      <Selector
        class="profile-input"
        :multiple="true"
        :value="serviceInstanceIds"
        size="small"
        :options="pprofStore.instances"
        placeholder="Select instances"
        @change="changeInstances"
        :filterable="true"
      />
    </div>
    <div>
      <div class="label">{{ t("pprofEvent") }}</div>
      <Radio class="mb-5" :value="eventType" :options="PprofEvents" @change="changeEventType" />
    </div>
    <div v-if="requiresDuration">
      <div class="label">{{ t("duration") }}</div>
      <Radio class="mb-5" :value="duration" :options="DurationOptions" @change="changeDuration" />
      <div v-if="duration === DurationOptions[5].value" class="custom-duration">
        <div class="label">{{ t("customDuration") }} ({{ t("minutes") }})</div>
        <el-input
          size="small"
          class="profile-input"
          v-model="customDurationMinutes"
          type="number"
          :min="1"
          placeholder="Enter duration in minutes"
        />
      </div>
      <div class="hint">{{ t("pprofDurationHint") }}</div>
    </div>
    <div v-if="requiresDumpPeriod">
      <div class="label">{{ t("pprofDumpPeriod") }}</div>
      <el-input
        size="small"
        class="profile-input"
        v-model="dumpPeriod"
        type="number"
        :min="1"
        placeholder="Enter dump period"
      />
      <div class="hint">
        {{ eventType === "BLOCK" ? t("pprofDumpPeriodBlockHint") : t("pprofDumpPeriodMutexHint") }}
      </div>
    </div>
    <div>
      <el-button @click="createTask" type="primary" class="create-task-btn" :loading="loading">
        {{ t("createTask") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { usePprofStore } from "@/store/modules/pprof";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import { DurationOptions, PprofEvents, DurationRequiredEvents, DumpPeriodRequiredEvents } from "./data";
  import type { PprofTaskCreationRequest } from "@/types/pprof";

  /* global defineEmits */
  const emits = defineEmits(["close"]);
  const pprofStore = usePprofStore();
  const selectorStore = useSelectorStore();
  const { t } = useI18n();
  const serviceInstanceIds = ref<string[]>([]);
  const eventType = ref<string>(PprofEvents[0].value);
  const duration = ref<string>(DurationOptions[1].value);
  const customDurationMinutes = ref<number>(5);
  const dumpPeriod = ref<number | string>("");
  const loading = ref<boolean>(false);
  const requiresDuration = computed(() => DurationRequiredEvents.includes(eventType.value));
  const requiresDumpPeriod = computed(() => DumpPeriodRequiredEvents.includes(eventType.value));

  function changeDuration(val: string) {
    duration.value = val;
  }

  function changeEventType(val: string) {
    eventType.value = val;
  }

  function changeInstances(options: { id: string }[]) {
    serviceInstanceIds.value = options.map((d: { id: string }) => d.id);
  }

  async function createTask() {
    const params: PprofTaskCreationRequest = {
      serviceId: selectorStore.currentService?.id || "",
      serviceInstanceIds: serviceInstanceIds.value,
      events: eventType.value,
    };

    if (requiresDuration.value) {
      const finalDuration =
        duration.value === DurationOptions[5].value ? Number(customDurationMinutes.value) : Number(duration.value);
      if (!finalDuration || finalDuration < 1) {
        ElMessage.error(t("invalidPprofDuration"));
        return;
      }
      params.duration = finalDuration;
    }

    if (requiresDumpPeriod.value) {
      const finalDumpPeriod = Number(dumpPeriod.value);
      if (!finalDumpPeriod || finalDumpPeriod < 1) {
        ElMessage.error(t("invalidPprofDumpPeriod"));
        return;
      }
      params.dumpPeriod = finalDumpPeriod;
    }

    loading.value = true;
    const res = await pprofStore.createTask(params);
    loading.value = false;
    if (res?.errors) {
      ElMessage.error(res.errors);
      return;
    }
    const result = res?.data?.task;
    if (result?.errorReason) {
      ElMessage.error(result.errorReason);
      return;
    }
    emits("close");
    ElMessage.success(t("taskCreatedSuccessfully"));
  }
</script>
<style lang="scss" scoped>
  .pprof-task {
    margin: 0 auto;
    width: 600px;
  }

  .label {
    margin-top: 10px;
    font-size: $font-size-normal;
  }

  .profile-input {
    width: 600px;
  }

  .create-task-btn {
    width: 600px;
    margin-top: 50px;
  }

  .custom-duration {
    margin-top: 10px;
  }

  .hint {
    font-size: $font-size-smaller;
    color: var(--text-color-placeholder);
  }
</style>
