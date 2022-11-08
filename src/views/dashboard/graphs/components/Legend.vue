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
  <div :style="`width: ${config.width || '100%'}`" v-if="source.length">
    <el-table :data="source" style="width: 100%">
      <el-table-column prop="name" label="Name" width="180" />
      <el-table-column
        v-for="item in headers"
        :prop="item"
        label="Address"
        :key="item"
      />
    </el-table>
  </div>
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import { LegendOptions } from "@/types/dashboard";
import useLegendProcess from "@/hooks/useLegendProcessor";

/*global defineProps */
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
const { aggregations } = useLegendProcess(props.config);
const { source, headers } = aggregations(props.data);
</script>
