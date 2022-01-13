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
    <span class="label">{{ t("showValues") }}</span>
    <el-switch
      v-model="showTableValues"
      active-text="Yes"
      inactive-text="No"
      @change="updateConfig({ showTableValues })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("tableHeaderCol1") }}</span>
    <el-input
      class="input"
      v-model="tableHeaderCol1"
      size="mini"
      placeholder="none"
      @change="updateConfig({ tableHeaderCol1 })"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("tableHeaderCol2") }}</span>
    <el-input
      class="input"
      v-model="tableHeaderCol2"
      size="mini"
      placeholder="none"
      @change="updateConfig({ tableHeaderCol2 })"
    />
  </div>
</template>
<script lang="ts" setup>
import { defineProps, ref, defineEmits } from "vue";
import type { PropType } from "vue";
import { TableConfig } from "@/types/dashboard";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const props = defineProps({
  config: {
    type: Object as PropType<TableConfig>,
    default: () => ({
      showTableValues: true,
      tableHeaderCol1: "",
      tableHeaderCol2: "",
    }),
  },
});
const emits = defineEmits(["update"]);
const showTableValues = ref(props.config.showTableValues);
const tableHeaderCol1 = ref(props.config.tableHeaderCol1);
const tableHeaderCol2 = ref(props.config.tableHeaderCol2);

function updateConfig(param: { [key: string]: unknown }) {
  emits("update", param);
}
</script>
<style lang="scss" scoped>
.slider {
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
