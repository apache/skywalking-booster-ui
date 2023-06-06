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
  <div class="flex-h content">
    <Tasks />
    <div class="vis-graph ml-5" v-loading="networkProfilingStore.loadNodes">
      <process-topology v-if="networkProfilingStore.nodes.length" :config="config" />
      <div class="text" v-else>
        {{ t("noData") }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import Tasks from "./components/Tasks.vue";
  import ProcessTopology from "./components/ProcessTopology.vue";
  import { useNetworkProfilingStore } from "@/store/modules/network-profiling";

  /*global defineProps */
  defineProps({
    config: {
      type: Object as PropType<any>,
      default: () => ({}),
    },
  });
  const networkProfilingStore = useNetworkProfilingStore();
  const { t } = useI18n();
</script>
<style lang="scss" scoped>
  .content {
    height: calc(100% - 30px);
    width: 100%;
  }

  .vis-graph {
    height: 100%;
    flex-grow: 2;
    min-width: 700px;
    overflow: hidden;
    position: relative;
    width: calc(100% - 330px);
  }

  .text {
    width: 100%;
    text-align: center;
    margin-top: 30px;
  }
</style>
