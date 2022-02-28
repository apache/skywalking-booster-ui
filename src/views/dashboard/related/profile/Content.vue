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
  <div class="flex-h">
    <div class="flex-v">
      <TaskList />
      <SegmentList />
    </div>
    <div class="flex-v">
      <SpanTree />
      <ThreadStack />
    </div>
  </div>
</template>
<script lang="ts" setup>
import TaskList from "./components/TaskList.vue";
import SegmentList from "./components/SegmentList.vue";
import SpanTree from "./components/SpanTree.vue";
import ThreadStack from "./components/ThreadStack.vue";
</script>
