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
  <div v-if="data.children.length">
    <div class="tabs">
      <span v-for="(item, idx) in data.children || []" :key="idx">{{
        item.name
      }}</span>
    </div>
    <grid-layout
      v-model:layout="state.layout"
      :col-num="24"
      :row-height="10"
      :is-draggable="true"
      :is-resizable="true"
      @layout-updated="layoutUpdatedEvent"
    >
      <grid-item
        v-for="item in state.layout"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.i"
        :key="item.i"
      >
        <Widget :item="item" />
      </grid-item>
    </grid-layout>
  </div>
  <div class="tabs" v-else>Please add Widgets</div>
</template>
<script lang="ts" setup>
import { defineProps, reactive } from "vue";
import type { PropType } from "vue";
import Widget from "./Widget.vue";
import { LayoutConfig } from "@/types/dashboard";

defineProps({
  data: {
    type: Object as PropType<{ type: string; children: any[] }>,
    default: () => ({ children: [] }),
  },
});
const state = reactive<{ layout: any }>({
  layout: [],
});
function layoutUpdatedEvent(newLayout: LayoutConfig) {
  state.layout = newLayout;
}
</script>
<style lang="scss" scoped>
.tabs {
  height: 30px;
  border-bottom: 1px solid #eee;

  span {
    display: inline-block;
    width: auto;
    padding: 5px 10px;
    border-right: 1px solid #ccc;
  }
}

.vue-grid-layout {
  background: #f7f9fa;
  height: auto !important;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 5px;
}
</style>
