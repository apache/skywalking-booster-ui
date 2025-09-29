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
  <div style="padding: 20px">
    <TraceContent v-if="traceStore.currentTrace" :trace="traceStore.currentTrace" />
    <div style="text-align: center; padding: 20px" v-if="!traceStore.loading && !traceStore.currentTrace"
      >No trace found</div
    >
  </div>
</template>

<script lang="ts" setup>
  import { useRoute } from "vue-router";
  import { computed, onMounted, provide } from "vue";
  import { useTraceStore } from "@/store/modules/trace";
  import TraceContent from "@/views/dashboard/related/trace/components/TraceQuery/TraceContent.vue";

  const route = useRoute();
  const traceStore = useTraceStore();
  const traceId = computed(() => route.params.traceId as string);
  provide("options", {});
  onMounted(() => {
    if (traceId.value) {
      traceStore.setTraceCondition({
        traceId: traceId.value,
      });
      traceStore.fetchV2Traces();
    }
  });
</script>
