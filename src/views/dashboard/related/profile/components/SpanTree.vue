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
  <div class="profile-trace-dashboard" v-if="profileStore.currentSegment">
    <div class="flex-h profile-trace-detail-wrapper">
      <div>
        <label>Trace ID</label>
        <el-input class="input mr-10 ml-5" readonly :value="profileStore.currentSegment.traceId" size="small" />
      </div>
      <Selector
        size="small"
        :value="dataMode"
        :options="ProfileDataMode"
        placeholder="Please select a profile data mode"
        @change="spanModeChange"
        class="mr-10 fliter"
      />
      <Selector
        size="small"
        :value="displayMode"
        :options="ProfileDisplayMode"
        placeholder="Please select a profile display mode"
        @change="selectDisplayMode"
        class="mr-10 fliter"
      />
      <el-button type="primary" size="small" :disabled="!profileStore.currentSpan.profiled" @click="analyzeProfile()">
        {{ t("analyze") }}
      </el-button>
    </div>
    <div class="profile-table">
      <Table
        :data="profileStore.segmentSpans"
        :traceId="profileStore.currentSegment.traceId"
        :headerType="WidgetType.Profile"
        @select="selectSpan"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import Table from "../../trace/components/Table.vue";
  import { useProfileStore } from "@/store/modules/profile";
  import Selector from "@/components/Selector.vue";
  import type { Span } from "@/types/trace";
  import type { Option } from "@/types/app";
  import { ElMessage } from "element-plus";
  import { ProfileDataMode, ProfileDisplayMode } from "./data";
  import { WidgetType } from "@/views/dashboard/data";

  /* global defineEmits*/
  const emits = defineEmits(["loading", "displayMode"]);
  const { t } = useI18n();
  const profileStore = useProfileStore();
  const dataMode = ref<string>("include");
  const displayMode = ref<string>("tree");
  const message = ref<string>("");
  const timeRange = ref<Array<{ start: number; end: number }>>([]);

  function selectSpan(span: Span) {
    profileStore.setCurrentSpan(span);
  }

  function spanModeChange(item: Option[]) {
    dataMode.value = item[0].value;
    updateTimeRange();
  }

  function selectDisplayMode(item: Option[]) {
    displayMode.value = item[0].value;
    emits("displayMode", displayMode.value);
  }

  async function analyzeProfile() {
    if (!profileStore.currentSpan.profiled) {
      ElMessage.info("It's a un-profiled span");
      return;
    }
    emits("loading", true);
    updateTimeRange();
    const params = timeRange.value.map((t: { start: number; end: number }) => {
      return {
        segmentId: profileStore.currentSpan.segmentId,
        timeRange: t,
      };
    });
    const res = await profileStore.getProfileAnalyze(params);
    emits("loading", false);
    if (res.errors) {
      ElMessage.error(res.errors);
    }
    if (res.tip) {
      message.value = res.tip;
    }
  }

  function updateTimeRange() {
    if (dataMode.value === "include") {
      timeRange.value = [
        {
          start: profileStore.currentSpan.startTime,
          end: profileStore.currentSpan.endTime,
        },
      ];
    } else {
      const { children, startTime, endTime } = profileStore.currentSpan;
      let dateRange = [];

      if (!children || !children.length) {
        timeRange.value = [
          {
            start: startTime,
            end: endTime,
          },
        ];
        return;
      }
      for (const item of children) {
        dateRange.push(
          {
            start: startTime,
            end: item.startTime,
          },
          {
            start: item.endTime,
            end: endTime,
          },
        );
      }
      dateRange = dateRange.reduce((prev: any[], cur) => {
        let isUpdate = false;
        for (const item of prev) {
          if (cur.start <= item.end && item.start <= cur.start) {
            isUpdate = true;
            item.start = item.start < cur.start ? cur.start : item.start;
            item.end = item.end < cur.end ? item.end : cur.end;
          }
        }
        if (!isUpdate) {
          prev.push(cur);
        }
        return prev;
      }, []);
      timeRange.value = dateRange.filter((item: any) => item.start !== item.end);
    }
  }
</script>
<style lang="scss" scoped>
  .profile-trace-dashboard {
    padding: 5px;
    flex-shrink: 0;
    height: 50%;
    width: 100%;
    min-width: 800px;
  }

  .profile-table {
    height: calc(100% - 30px);
    overflow: auto;
  }

  .profile-trace-detail-wrapper {
    padding: 5px 0;
    border-bottom: 1px solid rgb(0 0 0 / 10%);
    width: 100%;
  }

  .profile-trace-detail-ids {
    width: 300px;
  }

  .input {
    width: 250px;
  }

  .fliter {
    width: 140px;
  }
</style>
