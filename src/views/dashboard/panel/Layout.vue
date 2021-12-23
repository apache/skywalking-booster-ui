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
  <grid-layout
    v-model:layout="dashboardStore.layout"
    :col-num="12"
    :row-height="10"
    :is-draggable="true"
    :is-resizable="true"
    @layout-updated="layoutUpdatedEvent"
  >
    <grid-item
      v-for="item in dashboardStore.layout"
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
</template>
<script lang="ts" setup>
import { useDashboardStore } from "@/store/modules/dashboard";
import { GridItemData } from "@/types/dashboard";
import Widget from "./Widget.vue";

const dashboardStore = useDashboardStore();
function layoutUpdatedEvent(newLayout: GridItemData) {
  dashboardStore.setLayout(newLayout);
}
</script>
<style lang="scss" scoped>
.vue-grid-layout {
  background: #f7f9fa;
  flex-grow: 2;
  height: auto !important;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 5px;
}
</style>
