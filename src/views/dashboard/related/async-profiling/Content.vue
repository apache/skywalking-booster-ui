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
      <div class="mb-20">
        <Filter />
      </div>
      <div class="stack" v-loading="asyncProfilingStore.loadingTree">
        <EBPFStack :type="ComponentType" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted } from "vue";
  import { ElMessage } from "element-plus";
  import { useAsyncProfilingStore } from "@/store/modules/async-profiling";
  import { useSelectorStore } from "@/store/modules/selectors";
  import TaskList from "./components/TaskList.vue";
  import Filter from "./components/Filter.vue";
  import EBPFStack from "@/views/dashboard/related/ebpf/components/EBPFStack.vue";
  import { ComponentType } from "./components/data";

  const asyncProfilingStore = useAsyncProfilingStore();
  const selectorStore = useSelectorStore();

  onMounted(async () => {
    const resp = await asyncProfilingStore.getServiceInstances({ serviceId: selectorStore.currentService.id });
    if (resp && resp.errors) {
      ElMessage.error(resp.errors);
    }
  });
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
    overflow: hidden;
    position: relative;
    width: calc(100% - 330px);
  }

  .stack {
    width: 100%;
    overflow: auto;
    height: calc(100% - 100px);
    padding-bottom: 10px;
  }
</style>
