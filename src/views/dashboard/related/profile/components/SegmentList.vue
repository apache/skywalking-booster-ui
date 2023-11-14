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
  <div class="profile-trace-wrapper profile-segment flex-v">
    <div class="profile-t-tool flex-h">{{ t("sampledTraces") }}</div>
    <div class="profile-t-wrapper">
      <div class="no-data" v-show="!profileStore.segmentList.length">
        {{ t("noData") }}
      </div>
      <table class="profile-t">
        <tr class="profile-tr cp" v-for="(i, index) in profileStore.segmentList" @click="selectSegment(i)" :key="index">
          <td
            class="profile-td"
            :class="{
              selected: key === i.spans[0].segmentId,
            }"
          >
            <div
              class="ell mb-5"
              :class="{
                blue: !i.isError,
                red: i.isError,
              }"
            >
              <span class="b">{{ i.endpointNames[0] }}</span>
            </div>
            <div class="grey ell sm">
              <span class="tag mr-10 sm"> {{ i.duration }} ms </span>
              {{ dateFormat(parseInt(i.start)) }}
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { useProfileStore } from "@/store/modules/profile";
  import type { Trace } from "@/types/trace";
  import { dateFormat } from "@/utils/dateFormat";

  const { t } = useI18n();
  const profileStore = useProfileStore();
  const key = computed(
    () =>
      (profileStore.currentSegment &&
        profileStore.currentSegment.spans &&
        profileStore.currentSegment.spans.length &&
        profileStore.currentSegment.spans[0].segmentId) ||
      "",
  );

  async function selectSegment(item: Trace) {
    profileStore.setCurrentSegment(item);
    profileStore.setSegmentSpans(item.spans);
  }
</script>
<style lang="scss" scoped>
  .profile-trace-wrapper {
    width: 300px;
    height: 50%;
    overflow: auto;

    .no-data {
      text-align: center;
      margin-top: 10px;
    }

    .profile-t-wrapper {
      overflow: auto;
      flex-grow: 1;
      border-right: 1px solid var(--sw-trace-list-border);
    }

    .profile-t-loading {
      text-align: center;
      position: absolute;
      width: 100%;
      height: 70px;
      margin-top: 40px;
      line-height: 88px;
      overflow: hidden;

      .icon {
        width: 30px;
        height: 30px;
      }
    }

    .profile-t {
      width: 100%;
      border-spacing: 0;
      table-layout: fixed;
      flex-grow: 1;
      position: relative;
    }

    .profile-tr {
      &:hover {
        background-color: var(--sw-list-hover);
      }
    }

    .profile-td {
      padding: 5px 10px;
      border-bottom: 1px solid var(--sw-trace-list-border);

      &.selected {
        background-color: var(--sw-list-selected);
      }
    }

    .profile-t-tool {
      padding: 5px 10px;
      font-weight: bold;
      border-right: 1px solid var(--sw-trace-list-border);
      border-bottom: 1px solid var(--sw-trace-list-border);
      background-color: var(--sw-table-header);
    }

    .log-item {
      margin-top: 20px;
    }

    .profile-btn {
      color: $font-color;
      padding: 1px 3px;
      border-radius: 2px;
      font-size: $font-size-smaller;
    }
  }

  .profile-segment {
    border-top: 1px solid var(--sw-trace-list-border);
  }
</style>
