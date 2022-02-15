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
  <div :style="`height:${height}px;width:${width}px;`" v-if="isSankey">
    <Sankey />
  </div>
  <Graph v-else />
</template>
<script lang="ts" setup>
import { ref } from "vue";
import Graph from "./Graph.vue";
import Sankey from "./Sankey.vue";
import { EntityType } from "../../data";
import { useDashboardStore } from "@/store/modules/dashboard";

const dashboardStore = useDashboardStore();
const isSankey = ref<boolean>(
  [EntityType[2].value, EntityType[4].value].includes(dashboardStore.entity)
);
const height = ref<number>(document.body.clientHeight - 90);
const width = ref<number>(document.body.clientWidth - 40);
</script>
