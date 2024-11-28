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
  <div class="async-profile-task">
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
      <div class="label">
        <span class="mr-5 cp">{{ t("execArgs") }}</span>
        <el-popover placement="right" :width="480" trigger="hover" title="Async profiler extension parameters">
          <template #reference>
            <span>
              <Icon iconName="help" />
            </span>
          </template>
          <div>
            <p>
              <span class="mr-10">live </span>
              <span>- build allocation profile from live objects only</span>
            </p>
            <p>
              <span class="mr-10">lock[=DURATION] </span>
              <span>- profile contended locks overflowing the DURATION ns bucket (default: 10us)</span>
            </p>
            <p>
              <span class="mr-10">alloc[=BYTES] </span>
              <span>- profile allocations with BYTES interval</span>
            </p>
            <p>
              <span class="mr-10">interval=N </span>
              <span>- sampling interval in ns (default: 10'000'000, i.e. 10 ms)</span>
            </p>
            <p>
              <span class="mr-10">jstackdepth=N </span>
              <span>- maximum Java stack depth (default: 2048)</span>
            </p>
            <p>
              <span class="mr-10">chunksize=N </span>
              <span>- approximate size of JFR chunk in bytes (default: 100 MB)</span>
            </p>
            <p>
              <span class="mr-10">chunktime=N </span>
              <span>- duration of JFR chunk in seconds (default: 1 hour)</span>
            </p>
          </div>
        </el-popover>
      </div>
      <el-input size="small" class="profile-input" v-model="execArgs" />
    </div>
    <div>
      <el-button @click="createTask" type="primary" class="create-task-btn" :loading="loading">
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
  const loading = ref<boolean>(false);

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
    loading.value = true;
    const res = await asyncProfilingStore.createTask(params);
    loading.value = false;
    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    const { errorReason } = res.data;
    if (errorReason) {
      ElMessage.error(errorReason);
      return;
    }
    emits("close");
    ElMessage.success("Task created successfully");
  }
</script>
<style lang="scss" scoped>
  .async-profile-task {
    margin: 0 auto;
    width: 600px;
  }

  .date {
    font-size: $font-size-smaller;
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
</style>
