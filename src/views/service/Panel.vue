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
  <div class="service-detail">
    <div class="title">
      <span>{{ state.serviceID }}</span>
      <span>Types</span>
      <span>Technologies</span>
    </div>
    <div class="tabs">
      <router-link
        class="tab cp"
        v-for="tab in tabs"
        :key="tab"
        @click="handleClick(tab)"
        :class="{ active: tab === activeName }"
        :to="`${state.path}/${state.serviceID}/${tab}`"
      >
        {{ t(tab) }}
      </router-link>
    </div>
    <Endpoints v-if="state.type === tabs[2]" />
    <Metrics v-else-if="state.type === tabs[0]" />
    <Topology
      v-else-if="state.type === tabs[1]"
      msg="This is the Topology page"
    />
    <Traces v-else-if="state.type === tabs[3]" msg="This is the Trace page" />
    <Profiles v-else msg="This is the Profiles page" />
  </div>
</template>
<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import Metrics from "./Metrics.vue";
import Endpoints from "./Endpoints.vue";
import Topology from "./Topology.vue";
import Traces from "./Traces.vue";
import Profiles from "./Profiles.vue";
import { useAppStoreWithOut } from "@/store/modules/app";

const appStore = useAppStoreWithOut();
appStore.setPageTitle("General Service");
const route = useRoute();
const { t } = useI18n();
const tabs = ["metrics", "topologies", "endpoints", "traces", "profiles"];
const activeName = ref<string>(tabs[0]);
const state = reactive({
  serviceID: route.params.id,
  type: route.params.type,
  path: route.meta.headPath,
});
function handleClick(tab: string) {
  activeName.value = tab;
  state.type = tab;
}
</script>
<style lang="scss" scoped>
.service-detail {
  text-align: left;
}

.tabs {
  padding: 15px 15px 0 15px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.tab {
  display: inline-block;
  margin-right: 30px;
  font-size: 13px;
  font-weight: 400;
  height: 30px;

  &:hover {
    color: var(--el-color-primary);
  }

  &.active {
    color: var(--el-color-primary);
    border-bottom: 1px solid var(--el-color-primary);
  }
}

.title {
  padding: 5px 0 5px 15px;
  font-size: 14px;
  font-weight: 400;
  border-bottom: 1px solid #dfe4e8;
  background-color: #c4c8e133;

  span {
    display: inline-block;
    margin-right: 10px;
  }
}
</style>
