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
    <div class="profile-trace-detail-wrapper">
      <Selector
        size="small"
        :value="traceId || (traceIds[0] && traceIds[0].value) || ''"
        :options="traceIds"
        placeholder="Select a trace id"
        @change="changeTraceId"
        class="profile-trace-detail-ids mr-10"
      />
      <Selector
        size="small"
        :value="mode"
        :options="ProfileMode"
        placeholder="Select a mode"
        @change="spanModeChange"
        class="mr-10"
      />
      <el-button type="primary" size="small" @click="analyzeProfile()">
        {{ t("analyze") }}
      </el-button>
    </div>
    <div class="profile-table">
      <Table
        :data="profileStore.segmentSpans"
        :traceId="
          profileStore.currentSegment.traceIds &&
          profileStore.currentSegment.traceIds[0]
        "
        :showBtnDetail="true"
        headerType="profile"
        @select="selectSpan"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import Table from "../../trace/components/Table/Index.vue";
import { useProfileStore } from "@/store/modules/profile";
import Selector from "@/components/Selector.vue";
import { Span } from "@/types/trace";
import { Option } from "@/types/app";
import { ElMessage } from "element-plus";
import { ProfileMode } from "./data";

/* global defineEmits*/
const emits = defineEmits(["loading"]);
const { t } = useI18n();
const profileStore = useProfileStore();
const mode = ref<string>("include");
const message = ref<string>("");
const timeRange = ref<Array<{ start: number; end: number }>>([]);
const traceId = ref<string>("");
const traceIds = computed(() =>
  (profileStore.currentSegment.traceIds || []).map((id: string) => ({
    label: id,
    value: id,
  }))
);

function selectSpan(span: Span) {
  profileStore.setCurrentSpan(span);
}

function spanModeChange(item: Option[]) {
  mode.value = item[0].value;
  updateTimeRange();
}

function changeTraceId(opt: Option[]) {
  traceId.value = opt[0].value;
}

async function analyzeProfile() {
  emits("loading", true);
  updateTimeRange();
  const res = await profileStore.getProfileAnalyze({
    segmentId: profileStore.currentSegment.segmentId,
    timeRanges: timeRange.value,
  });
  emits("loading", false);
  if (res.errors) {
    ElMessage.error(res.errors);
  }
  if (res.tip) {
    message.value = res.tip;
  }
}

function updateTimeRange() {
  if (mode.value === "include") {
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
          start: this.currentSpan.startTime,
          end: this.currentSpan.endTime,
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
        }
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  width: 100%;
}

.profile-trace-detail-ids {
  width: 300px;
}
</style>
