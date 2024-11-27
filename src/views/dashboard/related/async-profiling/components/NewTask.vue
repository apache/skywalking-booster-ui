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
  <div class="profile-task">
    <div>
      <div class="label">{{ t("instance") }}</div>
      <Selector
        class="profile-input"
        :multiple="true"
        :value="serviceInstanceIds"
        size="small"
        :options="asyncProfilingStore.instances"
        placeholder="Select instances"
        @change="changeInstances"
        :filterable="false"
      />
    </div>
    <div>
      <div class="label">{{ t("duration") }}</div>
      <Radio class="mb-5" :value="duration" :options="DurationOptions" @change="changeDuration" />
    </div>
    <div>
      <div class="label">{{ t("profilingEvents") }}</div>
      <el-checkbox-group v-model="asyncEvents" class="profile-input mb-5">
        <el-checkbox v-for="event in ProfilingEvents" :label="event.label" :value="event.value" :key="event.value" />
      </el-checkbox-group>
    </div>
    <div>
      <div class="label">{{ t("execArgs") }}</div>
      <el-input size="small" class="profile-input" v-model="execArgs" />
    </div>
    <div>
      <el-button @click="createTask" type="primary" class="create-task-btn">
        {{ t("createTask") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAsyncProfilingStore } from "@/store/modules/async-profiling";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import type { Option } from "@/types/app";
  import { DurationOptions, ProfilingEvents } from "./data";

  /* global defineEmits */
  const emits = defineEmits(["close"]);
  const asyncProfilingStore = useAsyncProfilingStore();
  const selectorStore = useSelectorStore();
  const { t } = useI18n();
  const serviceInstanceIds = ref<string[]>([]);
  const asyncEvents = ref<string[]>([ProfilingEvents[0].value]);
  const duration = ref<string>(DurationOptions[0].value);
  const execArgs = ref<string>("");

  function changeDuration(val: string) {
    duration.value = val;
  }

  function changeInstances(options: Option[]) {
    serviceInstanceIds.value = options.map((d: Option) => d.value);
  }

  async function createTask() {
    const params = {
      serviceId: selectorStore.currentService.id,
      serviceInstanceIds: serviceInstanceIds.value,
      duration: Number(duration.value),
      events: asyncEvents.value,
      execArgs: execArgs.value,
    };
    const res = await asyncProfilingStore.createTask(params);
    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    const { tip } = res.data;
    if (tip) {
      ElMessage.error(tip);
      return;
    }
    emits("close");
    ElMessage.success("Task created successfully");
  }
</script>
<style lang="scss" scoped>
  .profile-task {
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
