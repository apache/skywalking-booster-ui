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
  <div class="dashboard-tool">
    <el-button size="mini">Save As</el-button>
    <el-button size="mini">Discard</el-button>
    <el-button size="mini" type="primary">Apply</el-button>
  </div>
  <div class="flex-h ds-main">
    <div class="ds-layout">
      <grid-layout
        v-model="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="draggable"
        :is-resizable="resizable"
        :vertical-compact="true"
        :use-css-transforms="true"
      >
        <grid-item
          v-for="item in layout"
          :static="item.static"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :key="item.i"
        >
          <span class="text">{{ itemTitle(item) }}</span>
        </grid-item>
      </grid-layout>
    </div>
    <div class="ds-config">Configurations</div>
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { ElButton } from "element-plus";
import { GridLayout, GridItem, GridItemData } from "vue-grid-layout";
interface CustomData extends GridItemData {
  label?: string;
  static: boolean;
}
const layout = reactive<CustomData[]>([
  { x: 0, y: 0, w: 2, h: 2, i: "0", static: false },
  { x: 2, y: 0, w: 2, h: 4, i: "1", static: true },
  { x: 4, y: 0, w: 2, h: 5, i: "2", static: false },
  { x: 6, y: 0, w: 2, h: 3, i: "3", static: false },
  { x: 8, y: 0, w: 2, h: 3, i: "4", static: false },
  { x: 10, y: 0, w: 2, h: 3, i: "5", static: false },
  { x: 0, y: 5, w: 2, h: 5, i: "6", static: false },
  { x: 2, y: 5, w: 2, h: 5, i: "7", static: false },
  { x: 4, y: 5, w: 2, h: 5, i: "8", static: false },
  { x: 6, y: 3, w: 2, h: 4, i: "9", static: true },
  { x: 8, y: 4, w: 2, h: 4, i: "10", static: false },
  { x: 10, y: 4, w: 2, h: 4, i: "11", static: false },
  { x: 0, y: 10, w: 2, h: 5, i: "12", static: false },
  { x: 2, y: 10, w: 2, h: 5, i: "13", static: false },
  { x: 4, y: 8, w: 2, h: 4, i: "14", static: false },
  { x: 6, y: 8, w: 2, h: 4, i: "15", static: false },
  { x: 8, y: 10, w: 2, h: 5, i: "16", static: false },
  { x: 10, y: 4, w: 2, h: 2, i: "17", static: false },
  { x: 0, y: 9, w: 2, h: 3, i: "18", static: false },
  { x: 2, y: 6, w: 2, h: 2, i: "19", static: false },
]);
console.log(layout);
const draggable = ref(true);
const resizable = ref(true);
const index = ref(0);
function itemTitle(item: any) {
  let result = item.i;
  if (item.static) {
    result += " - Static";
  }
  return result;
}
</script>
<style lang="scss" scoped>
.dashboard-tool {
  text-align: right;
  padding: 5px 10px;
  background: rgb(240, 242, 245);
  // border-bottom: 1px solid rgb(240, 242, 245);
}
.ds-main {
  background: rgb(240, 242, 245);
}
.ds-layout {
  // background: rgb(240, 242, 245);
  // background-color: #fafbfc;
  height: 890px;
  flex-grow: 2;
  overflow: auto;
  // padding: 0 5px;
}
.ds-config {
  width: 360px;
  margin: 5px 0;
  background-color: #fff;
  box-shadow: 5px 5px 5px #fff;
  text-align: center;
}
.panel {
  width: 300px;
  height: 300px;
  background-color: #fff;
  margin: 5px;
  text-align: center;
}
.vue-grid-layout {
  background: #eee;
}
.vue-grid-item:not(.vue-grid-placeholder) {
  background: #ccc;
  border: 1px solid black;
}
.vue-grid-item .resizing {
  opacity: 0.9;
}
.vue-grid-item .static {
  background: #cce;
}
.vue-grid-item .text {
  font-size: 24px;
  text-align: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  height: 100%;
  width: 100%;
}
.vue-grid-item .no-drag {
  height: 100%;
  width: 100%;
}
.vue-grid-item .minMax {
  font-size: 12px;
}
.vue-grid-item .add {
  cursor: pointer;
}
.vue-draggable-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 0;
  left: 0;
  background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#999999'/></svg>")
    no-repeat;
  background-position: bottom right;
  padding: 0 8px 8px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: pointer;
}
</style>
