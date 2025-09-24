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
  import { ref, computed, watch, reactive, onUnmounted, onMounted, PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import type { DurationTime, Duration } from "@/types/app";
  import ConditionTags from "@/views/components/ConditionTags.vue";
  import { useTraceStore, PageSize } from "@/store/modules/trace";
  import { InitializationDurationRow } from "@/store/modules/app";
  import { useDuration } from "@/hooks/useDuration";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import TimePicker from "@/components/TimePicker.vue";
  import timeFormat from "@/utils/timeFormat";
  import type { LayoutConfig } from "@/types/dashboard";
  /*global Indexable */
  const props = defineProps({
    needQuery: { type: Boolean, default: true },
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({}),
    },
  });
  const { t } = useI18n();
  const traceStore = useTraceStore();
  const appStore = useAppStoreWithOut();
  const { setDurationRow, getDurationTime, getMaxRange } = useDuration();
  const limit = ref(PageSize);
  const tags = ref<{ key: string; value: string }[]>([]);
  const durationRow = ref<Duration>(InitializationDurationRow);
  const filters = reactive<Indexable>(props.data.filters || {});
  const { duration: filtersDuration } = filters;
  const duration = ref<DurationTime>(
    filtersDuration
      ? { start: filtersDuration.startTime || "", end: filtersDuration.endTime || "", step: filtersDuration.step || "" }
      : getDurationTime(),
  );
  const maxRange = computed(() =>
    getMaxRange(appStore.coldStageMode ? appStore.recordsTTL?.coldTrace || 0 : appStore.recordsTTL?.trace || 0),
  );
  onMounted(() => {
    traceStore.setTraceList([]);
  });
  function updateTags(params: { tagsMap: { key: string; value: string }[]; tagsList: string[] }) {
    tags.value = params.tagsMap;
  }
  async function queryTraces() {
    traceStore.setTraceCondition({
      queryDuration: duration.value,
      tags: tags.value.length ? tags.value : undefined,
      paging: { pageNum: 1, pageSize: limit.value },
    });
    await traceStore.fetchV2Traces();
  }

  function changeDuration(val: Date[]) {
    durationRow.value = timeFormat(val);
    setDurationRow(durationRow.value);
    duration.value = getDurationTime();
  }

  onUnmounted(() => {
    traceStore.resetState();
  });

  watch(
    () => appStore.coldStageMode,
    () => {
      durationRow.value = InitializationDurationRow;
      setDurationRow(durationRow.value);
      duration.value = getDurationTime();
      queryTraces();
    },
  );
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
