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
  <span :class="vertical ? 'vertical' : 'horizontal'" v-for="tag in dynamicTags" :key="tag">
    <el-tag closable :disable-transitions="false" @close="handleClose(tag)">
      {{ tag }}
    </el-tag>
  </span>
  <el-input
    v-if="inputVisible"
    ref="InputRef"
    v-model="inputValue"
    class="ml-5 input-name"
    size="small"
    @keyup.enter="handleInputConfirm"
    @blur="handleInputConfirm"
  />
  <el-button v-else size="small" @click="showInput"> + {{ text }} </el-button>
</template>

<script lang="ts" setup>
  import { nextTick, ref, watch } from "vue";
  import type { PropType } from "vue";
  import { ElInput } from "element-plus";

  /*global defineProps, defineEmits*/
  const emits = defineEmits(["change"]);
  const props = defineProps({
    tags: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    text: { type: String, default: "" },
    vertical: { type: Boolean, default: false },
  });
  const inputValue = ref("");
  const dynamicTags = ref<string[]>(props.tags || []);
  const inputVisible = ref(false);
  const InputRef = ref<InstanceType<typeof ElInput>>();

  const handleClose = (tag: string) => {
    dynamicTags.value.splice(dynamicTags.value.indexOf(tag), 1);
  };

  const showInput = () => {
    inputVisible.value = true;
    nextTick(() => {
      InputRef.value!.input!.focus();
    });
  };

  const handleInputConfirm = () => {
    if (inputValue.value) {
      dynamicTags.value.push(inputValue.value);
    }
    inputVisible.value = false;
    inputValue.value = "";
    emits("change", dynamicTags.value);
  };

  watch(
    () => props.tags,
    () => {
      dynamicTags.value = props.tags || [];
    },
  );
</script>
<style lang="scss" scoped>
  .input-name {
    width: 250px;
  }

  .vertical {
    display: block;
    margin-bottom: 5px;
  }

  .horizontal {
    display: inline-block;
    margin-right: 5px;
  }
</style>
