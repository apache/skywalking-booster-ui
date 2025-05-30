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
  <el-tabs v-model="activeName" class="settings-tabs">
    <el-tab-pane v-for="tab in SettingsTabs" :label="tab.label" :name="tab.value" :key="tab.value">
      <component :is="TabPanes[tab.value]" />
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { SettingsTabs } from "./data";
  import ClusterNodes from "./components/ClusterNodes.vue";
  import General from "./components/General.vue";
  import TTL from "./components/TTL.vue";
  import DebuggingConfigDump from "./components/DebuggingConfigDump.vue";
  /*global Indexable*/
  const TabPanes: Indexable = {
    general: General,
    ttl: TTL,
    clusterNodes: ClusterNodes,
    dumpEffectiveConfigurations: DebuggingConfigDump,
  };
  const activeName = ref(SettingsTabs[0].value);
</script>
<style lang="scss" scoped>
  .settings-tabs {
    padding: 10px 20px;
  }

  .settings-tabs > .el-tabs__content {
    color: var(--sw-setting-color);
    padding-top: 10px;
  }
</style>
