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
  <div class="item">
    <span class="label">{{ t("title") }}</span>
    <el-input
      class="input"
      v-model="title"
      size="mini"
      placeholder="Please input title"
      @change="updateTitle"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("tooltipsContent") }}</span>
    <el-input
      class="input"
      v-model="tooltip"
      size="mini"
      placeholder="Please input tips"
      @change="updateTips"
    />
  </div>
</template>
<script lang="ts" setup>
import { ref, defineEmits, defineProps } from "vue";
import { useI18n } from "vue-i18n";

defineProps({
  config: {
    type: Object,
    default: () => ({ title: "", tooltips: "" }),
  },
});
const emits = defineEmits(["update"]);
const { t } = useI18n();
const title = ref<string>("");
const tooltip = ref<string>("");

function updateTitle(value: string) {
  emits("update", { value, label: "title" });
}
function updateTips(value: string) {
  emits("update", { value, label: "tips" });
}
</script>
<style lang="scss" scoped>
.label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 5px;
}

.input {
  width: 500px;
}

.item {
  margin-bottom: 10px;
}
</style>
