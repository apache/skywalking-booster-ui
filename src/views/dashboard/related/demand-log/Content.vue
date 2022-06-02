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
  <div
    class="log-content"
    ref="logContent"
    style="width: calc(100% - 60px); height: calc(100% - 170px)"
  ></div>
</template>
<script lang="ts" setup>
import { onMounted, ref, onUnmounted, watch, toRaw } from "vue";
import { useDemandLogStore } from "@/store/modules/demand-log";

/*global Nullable */
const demandLogStore = useDemandLogStore();
const monacoInstance = ref();
const logContent = ref<Nullable<HTMLDivElement>>(null);

onMounted(async () => {
  const monaco = await import("monaco-editor");
  monacoInstanceGen(monaco);
  window.addEventListener("resize", () => {
    editorLayout();
  });
});
function monacoInstanceGen(monaco: any) {
  monacoInstance.value = monaco.editor.create(logContent.value, {
    value: "",
    language: "text",
    wordWrap: true,
    minimap: { enabled: false },
  });
}
function editorLayout() {
  if (!logContent.value) {
    return;
  }
  const { width, height } = logContent.value.getBoundingClientRect();
  toRaw(monacoInstance.value).layout({
    height: height,
    width: width,
  });
}
onUnmounted(() => {
  toRaw(monacoInstance.value).dispose();
  monacoInstance.value = null;
  window.removeEventListener("resize", editorLayout);
});
watch(
  () => demandLogStore.logs,
  () => {
    toRaw(monacoInstance.value).setValue(demandLogStore.logs);
  }
);
</script>
<style lang="scss" scoped>
.log-content {
  min-width: 600px;
  min-height: 400px;
  // overflow: auto;
}
</style>
