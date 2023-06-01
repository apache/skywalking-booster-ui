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
        :value="instance.label"
        :options="continousProfilingStore.instances"
        placeholder="Select a instance"
        @change="changeInstance"
      />
      <span class="label mr-5">{{ t("process") }}</span>
      <Selector
        class="selector mr-10"
        size="small"
        :value="process.label"
        :options="continousProfilingStore.processes"
        placeholder="Select a process"
        @change="changeProcess"
      />
    </div>
    <div v-if="continousProfilingStore.selectedStrategy.type" class="vis-graph">
      <div
        class="graph-topology ml-5"
        v-loading="networkProfilingStore.loadNodes"
        v-if="continousProfilingStore.selectedStrategy.type === TargetTypes[2].value"
      >
        <process-topology v-if="networkProfilingStore.nodes.length" :config="config" />
        <div class="text" v-else>
          {{ t("noData") }}
        </div>
      </div>
      <div class="graph-flame ml-5" v-else>
        <div class="schedules">
          <EBPFSchedules :type="ComponentType" />
        </div>
        <div class="item">
          <EBPFStack :type="ComponentType" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
  import ProcessTopology from "@/views/dashboard/related/network-profiling/components/ProcessTopology.vue";
  import EBPFSchedules from "@/views/dashboard/related/ebpf/components/EBPFSchedules.vue";
  import EBPFStack from "@/views/dashboard/related/ebpf/components/EBPFStack.vue";
  import { TargetTypes, ComponentType } from "../data";
  import type { Instance, Process } from "@/types/selector";

  /*global defineProps, Recordable */
  defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
  });
  const continousProfilingStore = useContinousProfilingStore();
  const networkProfilingStore = useNetworkProfilingStore();
  const selectorStore = useSelectorStore();
  const { t } = useI18n();
  const process = ref<Recordable<Process>>({});
  const instance = ref<Recordable<Instance>>({});

  function changeInstance(opt: Recordable<Instance>[]) {
    instance.value = opt[0];
    continousProfilingStore.setCurrentInstance(instance.value);
  }

  function changeProcess(opt: Recordable<Process>[]) {
    process.value = opt[0];
  }

  async function getSelectors() {
    const serviceId = (selectorStore.currentService && selectorStore.currentService.id) || "";

    await continousProfilingStore.getServiceInstances(serviceId);
    instance.value = continousProfilingStore.instances[0] || {};
    await continousProfilingStore.getProcesses(instance.value.id);
    process.value = continousProfilingStore.processes[0] || {};
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
    height: calc(100% - 20px);
    flex-grow: 2;
    min-width: 700px;
    overflow: auto;
    width: 100%;
  }

  .graph-topology,
  .graph-flame {
    height: 100%;
    overflow: hidden;
    position: relative;
    width: calc(100% - 5px);
  }

  .graph-flame {
    overflow: auto;
  }

  .policy-graph {
    height: 100%;
    flex-grow: 2;
    overflow: auto;
  }

  .text {
    height: 100%;
    text-align: center;
    margin-top: 100px;
  }
</style>
