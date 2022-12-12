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
  <el-radio-group v-model="selected" @change="checked">
    <el-radio v-for="item in options" :key="item.value" :label="item.value">
      {{ item.label }}
    </el-radio>
  </el-radio-group>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import type { PropType } from "vue";

  /*global  defineProps, defineEmits */
  const emit = defineEmits(["change"]);
  const props = defineProps({
    options: {
      type: Array as PropType<
        {
          label: string | number;
          value: string | number;
        }[]
      >,
      default: () => [],
    },
    value: {
      type: String as PropType<string>,
      default: "",
    },
    size: { type: null, default: "default" },
  });

  const selected = ref<string>(props.value);

  function checked(opt: unknown) {
    emit("change", opt);
  }
</script>
