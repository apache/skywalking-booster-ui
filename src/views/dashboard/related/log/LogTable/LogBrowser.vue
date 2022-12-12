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
  <div @click="showSelectSpan" :class="['log-item', 'clearfix', 'flex-h']" ref="logItem">
    <div
      v-for="(item, index) in columns"
      :key="index"
      :class="['log', ['message', 'stack'].includes(item.label) ? 'max-item' : '']"
    >
      <span v-if="item.label === 'time'">{{ dateFormat(data.time) }}</span>
      <span v-else-if="item.label === 'errorUrl'">{{ data.pagePath }}</span>
      <el-tooltip v-else :content="data[item.label] || '-'">
        <span>
          {{ data[item.label] || "-" }}
        </span>
      </el-tooltip>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { BrowserLogConstants } from "./data";
  import { dateFormat } from "@/utils/dateFormat";

  /*global defineProps, defineEmits, NodeListOf  */
  const props = defineProps({
    data: { type: Object as any, default: () => ({}) },
  });
  const columns = BrowserLogConstants;
  const emit = defineEmits(["select"]);
  const logItem = ref<any>(null);

  function showSelectSpan() {
    const items: NodeListOf<any> = document.querySelectorAll(".log-item");

    for (const item of items) {
      item.style.background = "#fff";
    }

    logItem.value.style.background = "rgba(0, 0, 0, 0.1)";
    emit("select", props.data);
  }
</script>
<style lang="scss" scoped>
  .log-item {
    white-space: nowrap;
    position: relative;
    cursor: pointer;
  }

  .log-item.selected {
    background: rgba(0, 0, 0, 0.04);
  }

  .log-item:not(.level0):hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .log-item:hover {
    background: rgba(0, 0, 0, 0.04) !important;
  }

  .log-item > div {
    width: 10%;
    min-width: 140px;
    padding: 0 5px;
    display: inline-block;
    border: 1px solid transparent;
    border-right: 1px dotted silver;
    overflow: hidden;
    line-height: 30px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .max-item.log {
    width: 20%;
  }

  .log-item .text {
    width: 100% !important;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .log-item > div.log {
    line-height: 30px;
  }
</style>
