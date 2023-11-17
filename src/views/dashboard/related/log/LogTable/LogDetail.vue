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
  <div class="log-detail">
    <div class="mb-10 clear rk-flex" v-for="(item, index) in ServiceLogDetail" :key="index">
      <span class="g-sm-4 grey">{{ t(item.value) }}:</span>
      <span v-if="['timestamp', 'time'].includes(item.label)" class="g-sm-8 mb-10">
        {{ dateFormat(currentLog[item.label]) }}
      </span>
      <textarea
        class="content mb-10 g-sm-8"
        :readonly="true"
        v-else-if="item.label === 'content'"
        :value="contentFormat(item.label)"
      />
      <span v-else-if="item.label === 'tags'" class="g-sm-8 mb-10">
        <div v-for="(d, index) in logTags" :key="index">{{ d }}</div>
      </span>
      <span v-else class="g-sm-8 mb-10">{{ currentLog[item.label] }}</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { dateFormat } from "@/utils/dateFormat";
  import { formatJson } from "@/utils/formatJson";
  import { ServiceLogDetail } from "./data";

  /*global defineProps */
  const props = defineProps({
    currentLog: { type: Object as PropType<any>, default: () => ({}) },
  });
  const { t } = useI18n();
  const logTags = computed(() => {
    if (!props.currentLog.tags) {
      return [];
    }
    return props.currentLog.tags.map((d: { key: string; value: string }) => {
      return `${d.key} = ${d.value}`;
    });
  });

  function contentFormat(label: string) {
    try {
      return props.currentLog.contentType === "JSON"
        ? formatJson(JSON.parse(props.currentLog[label]))
        : props.currentLog[label];
    } catch (e) {
      return props.currentLog[label];
    }
  }
</script>
<style lang="scss" scoped>
  .content {
    min-height: 500px;
    border: none;
    outline: none;
    color: $font-color;
    overflow: auto;
    background-color: var(--el-dialog-bg-color);
  }
</style>
