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
        <el-input size="small" v-model="keyword" class="alarm-tool-input" @change="refreshAlarms({ pageNum: 1 })" />
      </div>
      <div class="pagination">
        <el-pagination
          v-model="pageNum"
          :page-size="pageSize"
          layout="prev, pager, next"
          :total="total"
          @current-change="changePage"
          :pager-count="5"
          small
          :style="
            appStore.theme === Themes.Light
              ? `--el-pagination-bg-color: #f0f2f5; --el-pagination-button-disabled-bg-color: #f0f2f5;`
              : ''
          "
        />
      </div>
    </div>
    <ConditionTags :type="'ALARM'" @update="(data) => refreshAlarms({ pageNum: 1, tagsMap: data.tagsMap })" />
  </nav>
</template>
<script lang="ts" setup>
  import { ref, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import ConditionTags from "@/views/components/ConditionTags.vue";
  import { AlarmOptions } from "./data";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useAlarmStore } from "@/store/modules/alarm";
  import { ElMessage } from "element-plus";
  import { Themes } from "@/constants/data";

  const appStore = useAppStoreWithOut();
  const alarmStore = useAlarmStore();
  const { t } = useI18n();
  const pageSize = 20;
  const entity = ref<string>("");
  const keyword = ref<string>("");
  const pageNum = ref<number>(1);
  const total = computed(() =>
    alarmStore.alarms.length === pageSize ? pageSize * pageNum.value + 1 : pageSize * pageNum.value,
  );

  refreshAlarms({ pageNum: 1 });

  async function refreshAlarms(param: { pageNum: number; tagsMap?: any }) {
    const params: any = {
      duration: appStore.durationTime,
      paging: {
        pageNum: param.pageNum,
        pageSize,
      },
      tags: param.tagsMap,
    };
    params.scope = entity.value || undefined;
    params.keyword = keyword.value || undefined;
    const res = await alarmStore.getAlarms(params);

    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  function changeEntity(param: any) {
    entity.value = param[0].value;
    refreshAlarms({ pageNum: 1 });
  }

  function changePage(p: number) {
    pageNum.value = p;
    refreshAlarms({ pageNum: p });
  }
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
