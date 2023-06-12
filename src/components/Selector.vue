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
    :multiple="multiple"
    :disabled="disabled"
    :style="{ borderRadius }"
    :clearable="clearable"
    :remote="isRemote"
    :reserve-keyword="isRemote"
    :remote-method="remoteMethod"
    :filterable="filterable"
  >
    <el-option
      v-for="item in options"
      :key="item.value || ''"
      :label="item.label || ''"
      :value="item.value || ''"
      :disabled="item.disabled || false"
    >
    </el-option>
  </el-select>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import type { PropType } from "vue";

  // interface Option {
  //   label: string | number;
  //   value: string | number;
  // }

  /*global  defineProps, defineEmits, Indexable*/
  const emit = defineEmits(["change", "query"]);
  const props = defineProps({
    options: {
      type: Array as PropType<
        ({
          label: string | number;
          value: string | number;
        } & { disabled?: boolean })[]
      >,
      default: () => [],
    },
    value: {
      type: [Array, String, Number, undefined] as PropType<any>,
      default: () => [],
    },
    size: { type: null, default: "default" },
    placeholder: {
      type: [String, undefined] as PropType<string>,
      default: "Select a option",
    },
    borderRadius: { type: Number, default: 3 },
    multiple: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    isRemote: { type: Boolean, default: false },
    filterable: { type: Boolean, default: true },
  });

  const selected = ref<string[] | string>(props.value);
  function changeSelected() {
    const options = props.options.filter((d: Indexable) =>
      props.multiple ? selected.value.includes(d.value) : selected.value === d.value,
    );
    emit("change", options);
  }

  function remoteMethod(query: string) {
    if (props.isRemote) {
      emit("query", query);
    }
  }

  watch(
    () => props.value,
    (data) => {
      selected.value = data;
    },
  );
</script>
<style lang="scss" scoped>
  .el-input__inner {
    border-radius: unset !important;
  }
</style>
