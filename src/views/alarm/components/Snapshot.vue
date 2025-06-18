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
  <div :style="{ width: `800px`, height: `${metrics.length * 300}px` }">
    <LineChart :intervalTime="appStore.intervalTime" :data="metrics" />
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import { useSnapshot } from "@/hooks/useSnapshot";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import LineChart from "./Line.vue";

  /*global defineProps */
  const props = defineProps({
    snapshot: { type: Object, default: () => {} },
  });
  const { processResults } = useSnapshot(props.snapshot.metrics);
  const metrics = computed(() => processResults());
  const appStore = useAppStoreWithOut();
</script>
