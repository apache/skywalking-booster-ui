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
  <div class="log-item flex-h">
    <div
      v-for="(item, index) in columns"
      :key="index"
      :class="item.label"
      @click="selectLog(item.label, data[item.label])"
    >
      <span v-if="item.label === 'timestamp'">
        {{ dateFormat(data.timestamp) }}
      </span>
      <span v-else-if="item.label === 'tags'">
        {{ level }}
      </span>
      <span v-else-if="item.label === 'traceId' && !noLink" :class="noLink ? '' : 'blue'">
        {{ data[item.label] }}
      </span>
      <span v-else>{{ data[item.label] }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, inject } from "vue";
  import { ServiceLogConstants } from "./data";
  import getDashboard from "@/hooks/useDashboardsSession";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { LayoutConfig } from "@/types/dashboard";
  import { dateFormat } from "@/utils/dateFormat";

  /*global defineProps, defineEmits, Recordable */
  const props = defineProps({
    data: { type: Object as any, default: () => ({}) },
    noLink: { type: Boolean, default: true },
  });
  const dashboardStore = useDashboardStore();
  const options: Recordable<LayoutConfig> = inject("options") || {};
  const emit = defineEmits(["select"]);
  const columns = ServiceLogConstants;
  const level = computed(() => {
    if (!props.data.tags) {
      return "";
    }
    return (props.data.tags.find((d: { key: string; value: string }) => d.key === "level") || {}).value || "";
  });

  function selectLog(label: string, value: string) {
    if (label === "traceId") {
      if (!value) {
        emit("select", props.data);
        return;
      }
      linkTrace(value);
      return;
    }
    emit("select", props.data);
  }
  function linkTrace(id: string) {
    const { associationWidget } = getDashboard(dashboardStore.currentDashboard);
    associationWidget(
      (options.id as any) || "",
      {
        sourceId: options.id || "",
        traceId: id,
      },
      "Trace",
    );
  }
</script>
<style lang="scss" scoped>
  .log-item {
    cursor: pointer;
    align-items: center;
    min-height: 30px;

    .traceId {
      width: 260px;
      cursor: pointer;

      span {
        display: inline-block;
        width: 100%;
      }

      .blue {
        color: #448dfe;
      }
    }

    .tags {
      width: 100px;
    }

    .content {
      width: 1000px;
    }

    .serviceName {
      width: 200px;
    }
  }

  .log-item:hover {
    background: rgb(0 0 0 / 4%);
  }

  .log-item > div {
    width: 140px;
    padding: 0 5px;
    display: inline-block;
    border: 1px solid transparent;
    border-right: 1px dotted silver;
    white-space: normal;
    word-break: break-all;
    overflow: hidden;
  }

  .log-item .text {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .log-item > div.method {
    height: 100%;
    padding: 3px 8px;
  }
</style>
