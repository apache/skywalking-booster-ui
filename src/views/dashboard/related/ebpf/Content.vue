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
  <div class="flex-h content">
    <TaskList />
    <div class="vis-graph ml-5">
      <div class="schedules">
        <EBPFSchedules />
      </div>
      <div class="item">
        <EBPFStack />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import TaskList from "./components/TaskList.vue";
  import EBPFSchedules from "./components/EBPFSchedules.vue";
  import EBPFStack from "./components/EBPFStack.vue";
</script>
<style lang="scss" scoped>
  .content {
    height: calc(100% - 30px);
    width: 100%;
  }

  .vis-graph {
    height: 100%;
    flex-grow: 2;
    min-width: 700px;
    overflow: auto;
  }

  .item {
    width: 100%;
    overflow: auto;
    height: calc(100% - 100px);
    padding-bottom: 10px;
  }

  .schedules {
    height: 90px;
    border-bottom: 1px solid $disabled-color;
    padding-right: 10px;
  }
</style>
