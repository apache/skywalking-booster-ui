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
  <div class="timeline-tool flex-h">
    <el-button class="flexible-minTimeline" size="small" @click="onToggleMinTimeline">
      <Icon iconName="sort" size="middle" />
    </el-button>
    <el-button size="small" @click="onToggleSpanPanel">
      <Icon iconName="sort" size="middle" style="transform: rotate(90deg)" />
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  const emit = defineEmits<{
    (e: "toggleSpanPanel"): void;
    (e: "toggleMinTimeline"): void;
  }>();

  function onToggleSpanPanel() {
    emit("toggleSpanPanel");
  }

  function onToggleMinTimeline() {
    emit("toggleMinTimeline");
  }
</script>
<style lang="scss" scoped>
  .timeline-tool {
    justify-content: flex-end;
    padding: 10px;
  }
</style>
