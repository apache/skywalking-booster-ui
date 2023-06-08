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
  <div class="content" v-if="continousProfilingStore.selectedStrategy.type === TargetTypes[2].value">
    <process-topology v-if="networkProfilingStore.nodes.length" :config="config" />
    <div class="text" v-else>
      {{ t("noData") }}
    </div>
  </div>
  <div class="content" v-else>
    <div class="schedules">
      <EBPFSchedules />
    </div>
    <div class="item">
      <EBPFStack />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import { useNetworkProfilingStore } from "@/store/modules/network-profiling";
  import { TargetTypes } from "../../continuous-profiling/data";
  import ProcessTopology from "@/views/dashboard/related/network-profiling/components/ProcessTopology.vue";
  import EBPFSchedules from "@/views/dashboard/related/ebpf/components/EBPFSchedules.vue";
  import EBPFStack from "@/views/dashboard/related/ebpf/components/EBPFStack.vue";

  /*global defineProps */
  defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
  });
  const { t } = useI18n();
  const continousProfilingStore = useContinousProfilingStore();
  const networkProfilingStore = useNetworkProfilingStore();
</script>
<style lang="scss" scoped>
  .content {
    width: 100%;
    height: calc(100% - 30px);
    flex-grow: 2;
    min-width: 700px;
    overflow: hidden;
    position: relative;
  }

  .text {
    width: 100%;
    text-align: center;
    margin-top: 30px;
  }

  .item {
    width: 100%;
    overflow: auto;
    height: calc(100% - 100px);
    padding-bottom: 10px;
  }

  .schedules {
    height: 90px;
    border-bottom: 1px solid #ccc;
    padding-right: 10px;
  }
</style>
