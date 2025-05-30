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
  <div class="debugging-config-dump">
    <div class="config-dump-content">
      <div
        class="mb-10 flex-h"
        v-for="(item, index) of Object.keys(settingsStore.debuggingConfig)"
        :key="`${item}${index}`"
      >
        <div class="config-key">{{ item }}: </div>
        <div>{{ settingsStore.debuggingConfig[item] }}</div>
      </div>
      <div v-if="!Object.keys(settingsStore.debuggingConfig).length" class="tips">No Data</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from "vue";
  import { useSettingsStore } from "@/store/modules/settings";

  const settingsStore = useSettingsStore();

  onMounted(() => {
    settingsStore.getDebuggingConfigDump();
  });
</script>
<style lang="scss" scoped>
  .config-dump-content {
    border: 1px solid var(--el-color-info-light-8);
    overflow: auto;
    padding: 5px;
    border-radius: 5px 3px;
    height: 700px;
  }

  .tips {
    text-align: center;
    width: 100%;
    color: var(--el-text-color-secondary);
  }

  .config-key {
    width: 30%;
  }

  .debugging-config-dump {
    color: var(--sw-setting-color);
    font-size: 13px;
  }

  .label {
    width: 200px;
    display: inline-block;
    font-weight: 500;
    color: $font-color;
  }
</style>
