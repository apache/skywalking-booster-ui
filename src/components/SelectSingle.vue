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
  <div class="bar-select cp flex-h" :class="{ active: visible }">
    <div class="bar-i" @click="setPopper">
      <span v-if="selected.value">
        {{ selected.label }}
      </span>
      <span class="no-data" v-else>Please select a option</span>
      <span class="remove-icon" @click="removeSelected" v-if="clearable"> × </span>
    </div>
    <div class="opt-wrapper" v-show="visible">
      <div
        class="opt ell"
        @click="handleSelect(i)"
        :class="{ 'select-disabled': selected.value === i.value }"
        v-for="i in options"
        :key="i.value"
      >
        {{ i.label }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import type { PropType } from "vue";
  import type { Option } from "@/types/app";

  /*global  defineProps, defineEmits*/
  const emit = defineEmits(["change"]);
  const props = defineProps({
    options: {
      type: Array as PropType<Option[]>,
      default: () => [],
    },
    value: {
      type: String as PropType<string>,
      default: () => "",
    },
    clearable: { type: Boolean, default: false },
  });
  const visible = ref<boolean>(false);
  const opt = props.options.find((d: Option) => props.value === d.value);
  const selected = ref<Option>(opt || { label: "", value: "" });

  function handleSelect(i: Option) {
    selected.value = i;
    emit("change", i.value);
  }
  function removeSelected() {
    selected.value = { label: "", value: "" };
    emit("change", "");
  }
  watch(
    () => props.value,
    (data) => {
      const opt = props.options.find((d: Option) => data === d.value);
      selected.value = opt || { label: "", value: "" };
    },
  );
  document.body.addEventListener("click", handleClick, false);

  function handleClick() {
    visible.value = false;
  }
  function setPopper(event: MouseEvent) {
    event.stopPropagation();
    visible.value = !visible.value;
  }
</script>
<style lang="scss" scoped>
  .bar-select {
    position: relative;
    justify-content: space-between;
    border: 1px solid var(--el-border-color);
    background: $theme-background;
    border-radius: 3px;
    color: $font-color;
    font-size: $font-size-smaller;
    height: 24px;

    .selected {
      padding: 0 3px;
      border-radius: 3px;
      margin: 3px;
      color: $active-color;
      background-color: var(--theme-background);
      border: 1px solid var(--el-color-primary);
      text-align: center;
    }
  }

  .no-data {
    color: #c0c4cc;
  }

  .bar-i {
    height: 100%;
    width: 100%;
    padding: 2px 10px;
    overflow: auto;
    color: var(--sw-setting-color);
    position: relative;

    &:hover {
      .remove-icon {
        display: block;
      }
    }
  }

  .remove-icon {
    position: absolute;
    right: 5px;
    top: 0;
    font-size: $font-size-normal;
    display: none;
    color: #aaa;
    cursor: pointer;
  }

  .opt-wrapper {
    color: var(--sw-setting-color);
    position: absolute;
    top: 26px;
    left: 0;
    background-color: $theme-background;
    box-shadow: 0 1px 6px rgb(99 99 99 / 20%);
    border: 1px solid var(--el-border-color);
    width: 100%;
    border-radius: 0 0 3px 3px;
    border-right-width: 1px !important;
    z-index: 10;
    overflow: auto;
    max-height: 200px;
    padding-bottom: 2px;

    .close {
      position: absolute;
      right: 10px;
      top: 12px;
      opacity: 0.6;

      &:hover {
        opacity: 1;
      }
    }
  }

  .opt {
    padding: 7px 15px;

    &.select-disabled {
      color: $active-color;
      cursor: not-allowed;
    }

    &:hover {
      background-color: var(--layout-background);
    }
  }
</style>
