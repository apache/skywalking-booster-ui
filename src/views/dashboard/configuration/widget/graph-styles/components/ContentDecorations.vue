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
  <div v-for="(key, index) in Object.keys(decorations)" :key="index" class="mb-10 flex-h">
    <div class="content-decoration" contenteditable="true" @blur="changeKeys($event, index)">
      {{ key }}
    </div>
    <div>: </div>
    <div class="content-decoration" contenteditable="true" @blur="changeValues($event, index)">
      {{ decorations[key] }}
    </div>
    <div>
      <Icon
        class="cp mr-5"
        v-if="index === Object.keys(decorations).length - 1"
        iconName="add_circle_outlinecontrol_point"
        size="middle"
        @click="addDecoration"
      />
      <Icon class="cp" iconName="remove_circle_outline" size="middle" @click="deleteDecoration(index)" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";

  const dashboardStore = useDashboardStore();
  const graph = dashboardStore.selectedGrid.graph || {};
  const decorations = ref<{ [key: string]: string }>(graph.contentDecorations || { value: "content" });

  function changeKeys(event: any) {
    console.log(event);
    // decorations.value[]
  }

  function addDecoration() {
    decorations.value = {
      ...decorations.value,
      value: "content",
    };
  }

  function deleteDecoration(index: number) {
    const keys = Object.keys(decorations.value);
    if (!keys.length) {
      return;
    }
    if (!keys[index]) {
      return;
    }
    delete decorations.value[keys[index]];
  }
</script>
<style lang="scss" scoped>
  .content-decoration {
    width: 200px;
    border: 1px solid $border-color;
    cursor: text;
    padding: 0 5px;
    border-radius: 3px;
    outline: none;
    margin-right: 5px;
    min-height: 26px;

    &:focus {
      border-color: $active-color;
    }
  }
</style>
