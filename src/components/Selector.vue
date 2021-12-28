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
  <el-select
    :size="size"
    v-model="selected"
    :placeholder="placeholder"
    @change="changeSelected"
    filterable
    :style="{ borderRadius }"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    >
    </el-option>
  </el-select>
</template>
<script lang="ts" setup>
import { defineProps, ref, defineEmits } from "vue";
import type { PropType } from "vue";
import { ElSelect, ElOption } from "element-plus";

interface Option {
  label: string;
  value: string;
}

const emit = defineEmits(["change"]);
const props = defineProps({
  options: {
    type: Array as PropType<Option[]>,
    default: () => [],
  },
  value: { type: String, default: "" },
  size: { type: String, default: "small" },
  placeholder: { type: String, default: "Select a option" },
  borderRadius: { type: Number, default: 3 },
});
const selected = ref<string>(props.value);
function changeSelected() {
  const optionSele = props.options.filter(
    (d: Option) => d.value === selected.value
  )[0];
  emit("change", optionSele);
}
</script>
<style lang="scss" scope>
.icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  fill: currentColor;

  &.sm {
    width: 14px;
    height: 14px;
  }

  &.middle {
    width: 18px;
    height: 18px;
  }

  &.lg {
    width: 24px;
    height: 24px;
  }

  &.loading {
    animation: loading 1.5s linear infinite;
  }

  &.logo {
    height: 30px;
    width: 110px;
  }

  &.xl {
    height: 30px;
    width: 30px;
  }
}

.el-input__inner {
  border-radius: unset !important;
}
</style>
