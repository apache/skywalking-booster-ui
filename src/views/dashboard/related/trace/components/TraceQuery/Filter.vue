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
  <div class="flex-h trace-query-filter">
    <ConditionTags :type="'TRACE'" @update="updateTags" />
    <el-button type="primary" @click="queryTraces"> {{ t("runQuery") }} </el-button>
  </div>
  <div class="flex-h mt-10 filter-row">
    <div class="mr-10 flex-h">
      <div class="grey mr-10 label">{{ t("limit") }}</div>
      <el-input-number size="small" v-model="limit" :min="10" />
    </div>
    <div class="mr-10 flex-h">
      <div class="sm b grey mr-5 label">{{ t("timeRange") }}</div>
      <TimePicker
        :value="[durationRow.start, durationRow.end]"
        :maxRange="maxRange"
        position="bottom"
        format="YYYY-MM-DD HH:mm"
        @input="changeDuration"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import ConditionTags from "@/views/components/ConditionTags.vue";
  import { useTraceStore } from "@/store/modules/trace";
  import { InitializationDurationRow } from "@/store/modules/app";
  import { Duration } from "@/types/app";
  import { useDuration } from "@/hooks/useDuration";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import TimePicker from "@/components/TimePicker.vue";
  import timeFormat from "@/utils/timeFormat";

  const { t } = useI18n();
  const traceStore = useTraceStore();
  const appStore = useAppStoreWithOut();
  const { getMaxRange } = useDuration();
  const limit = ref(10);
  const tags = ref<{ key: string; value: string }[]>([]);
  const durationRow = ref<Duration>(InitializationDurationRow);
  const maxRange = computed(() =>
    getMaxRange(appStore.coldStageMode ? appStore.recordsTTL?.coldTrace || 0 : appStore.recordsTTL?.trace || 0),
  );

  function updateTags(params: { tagsMap: { key: string; value: string }[]; tagsList: string[] }) {
    tags.value = params.tagsMap;
  }
  async function queryTraces() {
    const endTs = durationRow.value.end.getTime();
    const lookback = durationRow.value.end.getTime() - durationRow.value.start.getTime();
    const params: Record<string, unknown> = {
      limit: limit.value,
      endTs,
      lookback,
    };
    for (const tag of tags.value) {
      params[tag.key] = tag.value;
    }
    await traceStore.getZipkinTraces(params);
  }
  function changeDuration(val: Date[]) {
    durationRow.value = timeFormat(val);
  }
</script>
<style lang="scss" scoped>
  .trace-query-filter {
    justify-content: space-between;
    padding: 10px 10px 0;
  }

  .filter-row {
    padding: 0 10px 10px;
    border-bottom: 1px solid $border-color;

    .label {
      height: 28px;
      line-height: 28px;
    }
  }
</style>
