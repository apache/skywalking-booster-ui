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
  <Line :data="data" :intervalTime="intervalTime" :config="config" @click="clickEvent" />
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import Line from "./Line.vue";
  import type { AreaConfig, EventParams, RelatedTrace, Filters } from "@/types/dashboard";

  /*global defineProps, defineEmits */
  const emits = defineEmits(["click"]);
  defineProps({
    data: {
      type: Object as PropType<{ [key: string]: number[] }>,
      default: () => ({}),
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
    config: {
      type: Object as PropType<
        AreaConfig & {
          filters: Filters;
          relatedTrace: RelatedTrace;
          id: string;
          associate: { widgetId: string }[];
        }
      >,
      default: () => ({}),
    },
  });
  function clickEvent(params: EventParams) {
    emits("click", params);
  }
</script>
