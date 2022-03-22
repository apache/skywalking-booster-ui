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
  <Graph :config="config" v-if="isService" />
  <PodTopology :config="config" v-else />
</template>
<script lang="ts" setup>
import type { PropType } from "vue";
import Graph from "./components/Graph.vue";
import PodTopology from "./components/PodTopology.vue";
import { EntityType } from "../../data";
import { useDashboardStore } from "@/store/modules/dashboard";

/*global defineProps */
defineProps({
  config: {
    type: Object as PropType<any>,
    default: () => ({ graph: {} }),
  },
});
const dashboardStore = useDashboardStore();
const isService = [EntityType[0].value, EntityType[1].value].includes(
  dashboardStore.entity
);
</script>
