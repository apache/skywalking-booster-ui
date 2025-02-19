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
  <Selector
    class="mb-10"
    multiple
    :value="legend"
    size="small"
    :options="Options"
    @change="changeLegend"
    filterable
    v-if="config.asSelector"
  />
</template>
<script lang="ts" setup>
  import { computed, ref, watch } from "vue";
  import type { PropType } from "vue";
  import type { Option } from "@/types/app";
  import type { LegendOptions } from "@/types/dashboard";

  const props = defineProps({
    data: {
      type: Object as PropType<{ [key: string]: number[] }>,
      default: () => ({}),
    },
    config: {
      type: Object as PropType<LegendOptions>,
      default: () => ({}),
    },
  });
  const emits = defineEmits(["change"]);
  const legend = ref<string[]>([]);
  const Options = computed(() => Object.keys(props.data || {}).map((d: string) => ({ label: d, value: d })));

  function changeLegend(opt: Option[]) {
    legend.value = opt.map((d: Option) => d.value);
    emits("change", legend.value);
  }
  watch(
    () => props.data,
    () => {
      legend.value = Object.keys(props.data || {}).filter(
        (i: string) => Array.isArray(props.data[i]) && props.data[i].length,
      );
    },
  );
</script>
