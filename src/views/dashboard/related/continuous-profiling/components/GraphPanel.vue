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
      <el-button type="primary" size="small" @click="analyzeTask">
        {{ t("analysis") }}
      </el-button>
    </div>
    <div
      class="vis-graph-topology ml-5"
      v-loading="networkProfilingStore.loadNodes"
      v-if="continousProfilingStore.selectedContinousTask.type === TargetTypes[2].value"
    >
      <process-topology v-if="networkProfilingStore.nodes.length" :config="config" />
      <div class="text" v-else>
        {{ t("noData") }}
      </div>
    </div>
    <div class="vis-graph ml-5" v-else>
      <div class="schedules">
        <EBPFSchedules :type="ComponentType" />
      </div>
      <div class="item">
        <EBPFStack :type="ComponentType" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import ProcessTopology from "@/views/dashboard/related/network-profiling/components/ProcessTopology.vue";
  import EBPFSchedules from "@/views/dashboard/related/ebpf/components/EBPFSchedules.vue";
  import EBPFStack from "@/views/dashboard/related/ebpf/components/EBPFStack.vue";
  import { TargetTypes, ComponentType } from "../data";
  import dateFormatStep from "@/utils/dateFormat";
  import getLocalTime from "@/utils/localtime";

  /*global defineProps */
  defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
  });
  const continousProfilingStore = useContinousProfilingStore();
  const networkProfilingStore = useNetworkProfilingStore();
  const appStore = useAppStoreWithOut();
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

  async function analyzeTask() {
    if (continousProfilingStore.selectedContinousTask.type === TargetTypes[2].value) {
      await networkProfilingStore.setSelectedNetworkTask(continousProfilingStore.selectedContinousTask);
      await getTopology();

      return;
    }
    const res = await continousProfilingStore.getEBPFSchedules({
      taskId: continousProfilingStore.selectedContinousTask.taskId,
    });
    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  async function getTopology() {
    const { taskStartTime, fixedTriggerDuration } = networkProfilingStore.selectedNetworkTask;
    const startTime =
      fixedTriggerDuration > 1800 ? taskStartTime + fixedTriggerDuration * 1000 - 30 * 60 * 1000 : taskStartTime;
    let endTime = taskStartTime + fixedTriggerDuration * 1000;
    if (taskStartTime + fixedTriggerDuration * 1000 > new Date().getTime()) {
      endTime = new Date().getTime();
    }
    const resp = await networkProfilingStore.getProcessTopology({
      serviceInstanceId: instanceId.value,
      duration: {
        start: dateFormatStep(getLocalTime(appStore.utc, new Date(startTime)), appStore.duration.step, true),
        end: dateFormatStep(getLocalTime(appStore.utc, new Date(endTime)), appStore.duration.step, true),
        step: appStore.duration.step,
      },
    });
    if (resp.errors) {
      ElMessage.error(resp.errors);
    }
    return resp;
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

  .vis-graph {
    height: 100%;
    flex-grow: 2;
    min-width: 700px;
    overflow: auto;
  }

  .vis-graph-topology {
    height: 100%;
    flex-grow: 2;
    min-width: 700px;
    overflow: hidden;
    position: relative;
    width: calc(100% - 330px);
  }
</style>
