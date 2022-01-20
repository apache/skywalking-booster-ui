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
  <div class="chart-card" :style="{ fontSize: `${config.fontSize}px` }">
    {{
      typeof data[key] === "string"
        ? data[key]
        : isNaN(data[key])
        ? null
        : data[key].toFixed(2)
    }}
    <span v-show="config.showUint">{{ standard.unit }}</span>
  </div>
</template>
<script lang="ts" setup>
import { computed, PropType } from "vue";
import { CardConfig, StandardConfig } from "@/types/dashboard";

/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<{ [key: string]: number }>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<CardConfig>,
    default: () => ({ fontSize: 12, showUint: true }),
  },
  standard: {
    type: Object as PropType<StandardConfig>,
    default: () => ({ unit: "" }),
  },
});
const key = computed(() => Object.keys(props.data)[0]);
</script>
<style lang="scss" scoped>
.chart-card {
  box-sizing: border-box;
  color: #333;
}
</style>
