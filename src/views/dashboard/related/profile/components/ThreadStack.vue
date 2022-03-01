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
  <div v-if="profileStore.analyzeTrees.length" class="thread-stack">
    <StackTable
      :data="profileStore.analyzeTrees"
      :highlightTop="profileStore.highlightTop"
    />
    <div class="rk-trace-t-loading" v-show="loading">
      <Icon iconName="spinner" />
    </div>
    <div v-if="message">{{ message }}</div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import StackTable from "./Stack/Index.vue";
import { useProfileStore } from "@/store/modules/profile";

const profileStore = useProfileStore();
const loading = ref<boolean>(false);
const message = ref<string>("");
</script>
<style lang="scss" scoped>
.thread-stack {
  padding: 5px 12px;
  height: calc(50% - 50px);
  overflow: auto;
  width: 100%;
}
</style>
