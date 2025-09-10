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
  <div class="trace-content flex-v">
    <div class="trace-info">
      <div class="flex-h" style="justify-content: space-between">
        <h3>{{ trace.label }}</h3>
        <div>
          <el-button size="small" @click="showSpansTable">Spans Table</el-button>
          <el-button size="small">Download</el-button>
        </div>
      </div>
      <div class="trace-meta flex-h">
        <div>
          <span class="grey mr-5">Duration</span>
          <span class="value">{{ trace.duration }}ms</span>
        </div>
        <div>
          <span class="grey mr-5">Services</span>
          <span class="value">{{ trace.localEndpoint?.serviceName || "Unknown" }}</span>
        </div>
        <div>
          <span class="grey mr-5">Total Spans</span>
          <span class="value">{{ trace.spans?.length || 0 }}</span>
        </div>
        <div>
          <span class="grey mr-5">Trace ID</span>
          <span class="value">{{ trace.traceId }}</span>
        </div>
      </div>
    </div>
    <div class="flex-h">
      <div class="detail-section-timeline"> Timeline </div>
      <div class="detail-section-span">
        <div class="detail-section">
          <div class="detail-item">
            <span class="grey mr-10">Service name</span>
            <span class="value">{{ trace.localEndpoint?.serviceName || "Unknown" }}</span>
          </div>
          <div class="detail-item">
            <span class="grey mr-10">Span name</span>
            <span class="value">{{ trace.localEndpoint?.serviceName || "Unknown" }}</span>
          </div>
          <div class="detail-item">
            <span class="grey mr-10">Span ID</span>
            <span class="value">{{ trace.id }}</span>
          </div>
          <div class="detail-item">
            <span class="grey mr-10">Parent ID</span>
            <span class="value">{{ trace.parentId || "none" }}</span>
          </div>
        </div>
        <h4>Tags</h4>
        <div class="tags-section flex-v" v-if="trace.tags && Object.keys(trace.tags).length > 0">
          <div v-for="(value, key) in trace.tags" :key="key" class="tag-item">
            <span class="grey" style="width: 200px">{{ key }}</span>
            <span class="value">{{ value }}</span>
          </div>
        </div>
        <div v-else class="no-data">No tags available</div>
      </div>
    </div>

    <!-- Spans Table Drawer -->
    <SpansTableDrawer
      v-model:visible="spansTableVisible"
      :spans="trace.spans || []"
      :trace-id="trace.traceId"
      @view-span="handleViewSpan"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from "vue";
  import type { ZipkinTrace } from "@/types/trace";
  import SpansTableDrawer from "./SpansTableDrawer.vue";

  interface Props {
    trace: ZipkinTrace;
  }

  defineProps<Props>();

  const spansTableVisible = ref<boolean>(false);

  function showSpansTable() {
    spansTableVisible.value = true;
  }

  function handleViewSpan(span: ZipkinTrace) {
    // TODO: Implement span detail view
    console.log("View span details:", span);
  }
</script>

<style lang="scss" scoped>
  .trace-content {
    flex-grow: 1;
    height: 100%;
  }

  .trace-info {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .trace-info h3 {
    margin: 0 0 10px;
    color: var(--el-text-color-primary);
    font-size: 18px;
    font-weight: 600;
  }

  .trace-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  h4 {
    margin: 20px 0 10px;
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid var(--el-border-color-light);
    padding-bottom: 5px;
  }

  h4:first-child {
    margin-top: 0;
  }

  .detail-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .detail-item {
    display: inline-flex;
    align-items: center;
    padding-top: 5px;
  }

  .value {
    word-break: break-all;
  }

  .tags-section {
    max-height: calc(100% - 200px);
    overflow: auto;
  }

  .no-data {
    color: var(--el-text-color-placeholder);
    font-style: italic;
    text-align: center;
    padding: 20px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
    border: 1px dashed var(--el-border-color-light);
  }

  .detail-section-timeline {
    width: 65%;
  }

  .detail-section-span {
    width: 35%;
  }

  .tag-item {
    display: inline-flex;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }
</style>
