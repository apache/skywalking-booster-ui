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
  <VueDragResize
    :isActive="item.static"
    :w="item.w"
    :h="item.h"
    :x="item.x"
    :y="item.y"
    @resizing="resize"
    @dragging="resize"
  >
    <h3>Hello World {{ item.i }}</h3>
  </VueDragResize>
</template>
<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import type { PropType } from "vue";
import VueDragResize from "vue-drag-resize";
interface GridItemData {
  x: number;
  y: number;
  w: number;
  h: number;
  i: number;
  static: boolean;
}
const props = defineProps({
  item: { type: Object as PropType<GridItemData> },
});
const emit = defineEmits(["move"]);

function resize(newRect: {
  width: number;
  height: number;
  top: number;
  left: number;
}) {
  const m = {
    ...props.item,
    x: newRect.left,
    y: newRect.top,
    w: newRect.width,
    h: newRect.height,
  };
  emit("move", m);
}
</script>
