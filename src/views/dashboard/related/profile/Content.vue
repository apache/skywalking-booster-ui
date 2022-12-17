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
    <div class="list">
      <TaskList />
      <SegmentList />
    </div>
    <div class="item">
      <SpanTree @loading="loadTrees" />
      <div class="thread-stack">
        <StackTable
          v-if="profileStore.analyzeTrees.length"
          :data="profileStore.analyzeTrees"
          :highlightTop="profileStore.highlightTop"
        />
        <div class="t-loading" v-show="loading">
          <Icon :loading="true" iconName="spinner" size="middle" />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import TaskList from "./components/TaskList.vue";
  import SegmentList from "./components/SegmentList.vue";
  import SpanTree from "./components/SpanTree.vue";
  import StackTable from "./components/Stack/Index.vue";
  import { useProfileStore } from "@/store/modules/profile";

  const loading = ref<boolean>(false);
  const profileStore = useProfileStore();

  function loadTrees(l: boolean) {
    loading.value = l;
  }
</script>
<style lang="scss" scoped>
  .content {
    height: calc(100% - 30px);
    width: 100%;
  }

  .item {
    height: 100%;
    flex-grow: 2;
    overflow: auto;
  }

  .list {
    width: 300px;
    height: 100%;
  }

  .thread-stack {
    padding: 5px;
    height: calc(50% - 20px);
    overflow: auto;
    width: 100%;
  }

  .t-loading {
    text-align: center;
    width: 100%;
    overflow: hidden;
    height: calc(50% - 20px);
  }
</style>
