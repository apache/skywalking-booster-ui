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
      <VueDragResize
        :isActive="item.static"
        :w="item.w"
        :h="item.h"
        :x="item.x"
        :y="item.y"
        @resizing="resize"
        @dragging="resize"
        v-for="item in layout"
        :key="item.i"
      >
        <h3>Hello World {{ item.i }}</h3>
      </VueDragResize>
    </div>
    <div class="ds-config">Configurations</div>
  </div>
</template>
<script lang="ts">
import { toRefs, defineComponent, reactive, ref } from "vue";
import { ElButton } from "element-plus";
import VueDragResize from "vue-drag-resize";

export interface GridItemData {
  x: number;
  y: number;
  w: number;
  h: number;
  i: number;
  static: boolean;
}

export default defineComponent({
  name: "dashboardEdit",
  components: {
    ElButton,
    VueDragResize,
  },
  setup() {
    const layout = ref<GridItemData[]>([
      { x: 300, y: 100, w: 200, h: 200, i: 0, static: true },
      { x: 500, y: 100, w: 200, h: 200, i: 1, static: true },
      { x: 700, y: 100, w: 200, h: 200, i: 2, static: true },
      { x: 900, y: 100, w: 200, h: 200, i: 3, static: true },
    ]);

    function resize(newRect: {
      width: number;
      height: number;
      top: number;
      left: number;
    }) {
      console.log(newRect);
    }
    return { resize, layout };
  },
});
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
