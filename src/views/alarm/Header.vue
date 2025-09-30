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
  <nav class="alarm-tool flex-v">
    <div class="flex-h">
      <div class="mr-10">
        <span class="grey">{{ t("entityType") }}: </span>
        <Selector
          v-model="entity"
          :options="AlarmOptions"
          placeholder="Select a layer"
          @change="changeEntity"
          class="alarm-tool-input"
          size="small"
        />
      </div>
      <div class="mr-10 ml-10">
        <span class="grey">{{ t("searchKeyword") }}: </span>
        <el-input size="small" v-model="keyword" class="alarm-tool-input" />
      </div>
      <div>
        <span class="sm b grey mr-5">{{ t("timeRange") }}:</span>
        <TimePicker
          :value="[durationRow.start, durationRow.end]"
          :maxRange="maxRange"
          position="bottom"
          format="YYYY-MM-DD HH:mm"
          @input="changeDuration"
        />
      </div>
      <div class="pagination">
        <el-pagination
          v-model="pageNum"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="total"
          @current-change="changePage"
          :pager-count="5"
          size="small"
          :style="
            appStore.theme === Themes.Light
              ? `--el-pagination-bg-color: #f0f2f5; --el-pagination-button-disabled-bg-color: #f0f2f5;`
              : ''
          "
        />
      </div>
    </div>
    <div class="flex-h mt-5" style="justify-content: space-between">
      <ConditionTags :type="'ALARM'" @update="(data) => changeTags(data.tagsMap)" />
      <el-button size="small" type="primary" @click="refreshAlarms({ pageNum: 1 })">
        {{ t("runQuery") }}
      </el-button>
    </div>
  </nav>
</template>
<script lang="ts" setup>
  import { ref, computed, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import ConditionTags from "@/views/components/ConditionTags.vue";
  import { AlarmOptions } from "./data";
  import { useAppStoreWithOut, InitializationDurationRow } from "@/store/modules/app";
  import { useAlarmStore } from "@/store/modules/alarm";
  import { useDuration } from "@/hooks/useDuration";
  import timeFormat from "@/utils/timeFormat";
  import type { DurationTime, Duration } from "@/types/app";
  import { Themes } from "@/constants/data";
  /*global Indexable */
  const appStore = useAppStoreWithOut();
  const alarmStore = useAlarmStore();
  const { t } = useI18n();
  const { setDurationRow, getDurationTime, getMaxRange } = useDuration();
  const pageSize = 20;
  const entity = ref<string>("");
  const keyword = ref<string>("");
  const pageNum = ref<number>(1);
  const duration = ref<DurationTime>(getDurationTime());
  const durationRow = ref<Duration>(InitializationDurationRow);
  const tagsMap = ref<{ key: string; value: string }[]>();

  const total = computed(() =>
    alarmStore.alarms.length === pageSize ? pageSize * pageNum.value + 1 : pageSize * pageNum.value,
  );
  const maxRange = computed(() =>
    getMaxRange(appStore.coldStageMode ? appStore.recordsTTL?.coldNormal || 0 : appStore.recordsTTL?.normal || 0),
  );

  refreshAlarms({ pageNum: 1 });

  async function refreshAlarms(param: { pageNum: number }) {
    const params: Indexable = {
      duration: duration.value,
      paging: {
        pageNum: param.pageNum,
        pageSize,
      },
      tags: tagsMap.value,
    };
    params.scope = entity.value || undefined;
    params.keyword = keyword.value || undefined;
    const res = await alarmStore.getAlarms(params);

    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  function changeDuration(val: Date[]) {
    durationRow.value = timeFormat(val);
    setDurationRow(durationRow.value);
    duration.value = getDurationTime();
  }

  function changeEntity(param: { value: string }[]) {
    entity.value = param[0].value;
  }

  function changePage(p: number) {
    pageNum.value = p;
    refreshAlarms({ pageNum: p });
  }

  function changeTags(tags?: { key: string; value: string }[]) {
    tagsMap.value = tags || undefined;
  }

  watch(
    () => appStore.coldStageMode,
    () => {
      durationRow.value = InitializationDurationRow;
      setDurationRow(durationRow.value);
      duration.value = getDurationTime();
      refreshAlarms({ pageNum: 1 });
    },
  );
</script>
<style lang="scss" scoped>
  .alarm-tool {
    font-size: $font-size-smaller;
    border-bottom: 1px solid var(--sw-alarm-tool-border);
    background-color: var(--sw-alarm-tool);
    padding: 10px;
    position: relative;
  }

  .alarm-tool-input {
    border-style: unset;
    outline: 0;
    padding: 2px 5px;
    width: 250px;
    border-radius: 3px;
  }

  .pagination {
    position: absolute;
    top: 10px;
    right: 5px;
  }
</style>
