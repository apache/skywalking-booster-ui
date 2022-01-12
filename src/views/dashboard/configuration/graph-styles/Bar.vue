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
  <div>
    <span class="label">Show Background</span>
    <el-switch
      v-model="showBackground"
      active-text="Yes"
      inactive-text="No"
      @change="changeConfig({ showBackground })"
    />
  </div>
</template>
<script lang="ts" setup>
import { defineProps, ref, defineEmits } from "vue";
import type { PropType } from "vue";
import { BarConfig } from "@/types/dashboard";

const props = defineProps({
  config: {
    type: Object as PropType<BarConfig>,
    default: () => ({ showBackground: true, barWidth: 30 }),
  },
});
const emits = defineEmits(["update"]);
const showBackground = ref(props.config.showBackground || false);

function changeConfig(param: { [key: string]: unknown }) {
  emits("update", param);
}
</script>
<style lang="scss" scoped>
.bar-width {
  width: 500px;
  margin-top: -13px;
}

.label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 5px;
}
</style>
