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
  <div class="policy-graph flex-v">
    <div class="header">
      <span class="label mr-5">{{ t("instance") }}</span>
      <Selector
        class="selector mr-10"
        size="small"
        :value="instanceId"
        :options="continousProfilingStore.instances"
        placeholder="Select a instance"
        @change="changeInstance"
      />
      <span class="label mr-5">{{ t("process") }}</span>
      <Selector
        class="selector mr-10"
        size="small"
        :value="processId"
        :options="continousProfilingStore.processes"
        placeholder="Select a process"
        @change="changeProcess"
      />
      <el-button type="primary" size="small">
        {{ t("analysis") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";

  const continousProfilingStore = useContinousProfilingStore();
  const selectorStore = useSelectorStore();
  const { t } = useI18n();
  const processId = ref<string>("");
  const instanceId = ref<string>("");

  function changeInstance(opt: { id: string }[]) {
    instanceId.value = opt[0].id;
  }

  function changeProcess(opt: { id: string }[]) {
    processId.value = opt[0].id;
  }

  async function getSelectors() {
    const serviceId = (selectorStore.currentService && selectorStore.currentService.id) || "";

    await continousProfilingStore.getServiceInstances(serviceId);
    instanceId.value = (continousProfilingStore.instances[0] || {}).id || "";
    await continousProfilingStore.getProcesses(instanceId.value);
    processId.value = (continousProfilingStore.processes[0] || {}).id || "";
  }
  getSelectors();

  watch(
    () => selectorStore.currentService,
    () => {
      getSelectors();
    },
  );
</script>
<style lang="scss" scoped>
  .header {
    margin: 10px;
  }

  .label {
    font-size: 14px;
  }

  .selector {
    width: 220px;
  }
</style>
