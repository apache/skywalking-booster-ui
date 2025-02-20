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
    collapseTags
    collapseTagsTooltip
    v-if="show"
  />
</template>
<script lang="ts" setup>
  import { computed, ref, watch } from "vue";
  import type { PropType } from "vue";
  import type { Option } from "@/types/app";
  import Selector from "./Selector.vue";

  const props = defineProps({
    data: {
      type: Array as PropType<{ name: string }[]>,
      default: () => [],
    },
    colors: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    show: {
      type: Boolean,
      default: false,
    },
    isConfigPage: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits(["change"]);
  const legend = ref<string[]>([]);
  const Options = computed(() =>
    props.data.map((d: { name: string }, index: number) => ({
      label: d.name,
      value: d.name,
      color: props.colors[index % props.colors.length],
    })),
  );

  function changeLegend(opt: Option[]) {
    legend.value = opt.map((d: Option) => d.value);
    emits("change", legend.value);
  }

  watch(
    () => props.data,
    () => {
      legend.value = props.data.map((d) => d.name);
    },
  );
</script>
