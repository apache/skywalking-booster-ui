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
  <div class="log-content" ref="logContent"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onUnmounted } from "vue";
import { useDemandLogStore } from "@/store/modules/demand-log";

/*global Nullable */
const demandLogStore = useDemandLogStore();
const monacoInstance = ref();
const logContent = ref<Nullable<HTMLDivElement>>(null);

onMounted(() => {
  import("monaco-editor/esm/vs/editor/editor.api").then((monaco) => {
    monacoInstanceGen(monaco);
  });
});
function monacoInstanceGen(monaco: any) {
  monaco.languages.register({ id: "custom" });
  monacoInstance.value = monaco.editor.create(logContent.value, {
    value: demandLogStore.logs,
    language: "javascript",
  });
}
onUnmounted(() => {
  monacoInstance.value = null;
});
</script>
<style lang="scss" scoped>
.log-content {
  min-height: 300px;
  width: 100%;
  min-width: 600px;
  height: calc(100% - 140px);
}
</style>
