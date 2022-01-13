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
    <span class="label">{{ t("maxItemNum") }}</span>
    <el-input
      class="input"
      v-model="topN"
      size="mini"
      placeholder="none"
      type="number"
      :min="1"
      :max="100"
      @change="updateConfig({ topN })"
    />
  </div>
</template>
<script lang="ts" setup>
import { defineProps, ref, defineEmits } from "vue";
import type { PropType } from "vue";
import { TopListConfig } from "@/types/dashboard";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  config: {
    type: Object as PropType<TopListConfig>,
    default: () => ({
      topN: 10,
    }),
  },
});
const emits = defineEmits(["update"]);
const topN = ref(props.config.topN);

function updateConfig(param: { [key: string]: unknown }) {
  emits("update", param);
}
</script>
<style lang="scss" scoped>
.label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 5px;
}
</style>
