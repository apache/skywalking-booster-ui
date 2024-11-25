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
  <div class="flex-h">
    <Selector
      class="profile-input"
      :multiple="true"
      :value="serviceInstanceIds"
      size="small"
      :options="instances"
      placeholder="Select instances"
      @change="changeInstances"
    />
    <el-button type="primary" size="small" @click="analyzeProfiling">
      {{ t("analyze") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAsyncProfilingStore } from "@/store/modules/async-profiling";
  import type { Instance } from "@/types/selector";
  import type { Option } from "@/types/app";

  const { t } = useI18n();
  const asyncProfilingStore = useAsyncProfilingStore();
  const serviceInstanceIds = ref<string[]>([]);
  const instances = computed(() =>
    asyncProfilingStore.instances.filter((d: Instance) =>
      asyncProfilingStore.selectedTask.serviceInstanceIds.includes(d.id),
    ),
  );

  function changeInstances(options: Option[]) {
    serviceInstanceIds.value = options.map((d: Option) => d.value);
  }

  function analyzeProfiling() {}
</script>
<style>
  .profile-input {
    width: 300px;
  }
</style>
