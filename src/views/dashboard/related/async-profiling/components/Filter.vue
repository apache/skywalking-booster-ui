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
      class="filter-selector"
      :multiple="true"
      :value="serviceInstanceIds"
      size="small"
      :options="instances"
      placeholder="Select instances"
      @change="changeInstances"
    />
    <Selector
      class="filter-events"
      :value="selectedEventType"
      size="small"
      :options="eventTypes"
      placeholder="Select a event"
      @change="changeEventType"
    />
    <el-button type="primary" size="small" @click="analyzeProfiling">
      {{ t("analyze") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { useAsyncProfilingStore } from "@/store/modules/async-profiling";
  import type { Instance } from "@/types/selector";
  import type { Option } from "@/types/app";
  import { EventsMap, ProfilingEvents, JFREventType } from "./data";

  const { t } = useI18n();
  const asyncProfilingStore = useAsyncProfilingStore();
  const serviceInstanceIds = ref<string[]>([]);
  const selectedEventType = ref<string>("");
  const eventTypes = computed(() =>
    (asyncProfilingStore.selectedTask.events ?? [])
      .map((d: string) => {
        if (d === ProfilingEvents[1]) {
          return [
            { label: JFREventType.OBJECT_ALLOCATION_IN_NEW_TLAB, value: JFREventType.OBJECT_ALLOCATION_IN_NEW_TLAB },
            { label: JFREventType.OBJECT_ALLOCATION_OUTSIDE_TLAB, value: JFREventType.OBJECT_ALLOCATION_OUTSIDE_TLAB },
          ];
        }

        return { label: d, value: d };
      })
      .flat(),
  );
  const instances = computed(() =>
    asyncProfilingStore.instances.filter((d: Instance) =>
      (asyncProfilingStore.selectedTask.successInstanceIds ?? []).includes(d.id),
    ),
  );

  function changeInstances(options: Option[]) {
    serviceInstanceIds.value = options.map((d: Option) => d.value);
    asyncProfilingStore.setAnalyzeTrees([]);
  }

  function changeEventType(options: Option[]) {
    selectedEventType.value = options[0].value;
    asyncProfilingStore.setAnalyzeTrees([]);
  }

  async function analyzeProfiling() {
    const instanceIds = asyncProfilingStore.instances
      .filter((d: Instance) => (serviceInstanceIds.value ?? []).includes(d.value))
      .map((d: Instance) => d.id);
    const res = await asyncProfilingStore.getAsyncProfilingAnalyze({
      instanceIds,
      taskId: asyncProfilingStore.selectedTask.id,
      eventType: (EventsMap as any)[selectedEventType.value],
    });
    if (res.data && res.data.errors) {
      ElMessage.error(res.data.errors);
      return;
    }
  }

  watch(
    () => asyncProfilingStore.selectedTask.successInstanceIds,
    () => {
      serviceInstanceIds.value = [];
      selectedEventType.value = "";
    },
  );
</script>
<style>
  .filter-selector {
    width: 400px;
    margin-right: 10px;
  }

  .filter-events {
    width: 300px;
    margin-right: 10px;
  }
</style>
