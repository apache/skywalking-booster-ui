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
  <div class="widget">
    <div class="header flex-h">
      <div>title</div>
      <div class="operations">
        <Icon class="mr-5" size="sm" iconName="createmode_editedit" />
        <Icon size="sm" iconName="clearclose" @click="removeWidget" />
      </div>
    </div>
    <div class="body">chart</div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps } from "vue";
import type { PropType } from "vue";
import { GridItemData } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";

const props = defineProps({
  item: { type: Object as PropType<GridItemData> },
});
const dashboardStore = useDashboardStore();
function removeWidget() {
  dashboardStore.removeWidget(props.item);
}
</script>
<style lang="scss" scoped>
.widget {
  font-size: 12px;
  // position: relative;
}

.header {
  height: 30px;
  padding: 5px;
  width: 100%;
  border-bottom: 1px solid #eee;
  justify-content: space-between;
}

.operations {
  color: #aaa;
  cursor: pointer;
}

.body {
  padding: 5px;
}
</style>
