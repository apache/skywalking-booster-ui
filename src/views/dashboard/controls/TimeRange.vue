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
  <div class="time-range">
    <div class="header">
      <el-popover placement="bottom" trigger="click" :width="100" v-if="dashboardStore.editMode">
        <template #reference>
          <span>
            <Icon iconName="ellipsis_v" size="middle" class="operation" />
          </span>
        </template>
        <div class="tools" @click="editConfig">
          <span>{{ t("edit") }}</span>
        </div>
        <div class="tools" @click="removeTopo">
          <span>{{ t("delete") }}</span>
        </div>
      </el-popover>
    </div>
    <div
      class="body"
      :style="{
        backgroundColor: TextColors[graph.backgroundColor],
        justifyContent: graph.textAlign,
        color: TextColors[graph.fontColor],
      }"
    >
      <span
        class="mr-5"
        :style="{
          fontSize: graph.fontSize + 'px',
        }"
        >{{ graph.text }}
      </span>
      <Icon iconName="time_range" size="middle" />
      <span
        class="ml-5"
        :style="{
          fontSize: graph.fontSize + 'px',
        }"
      >
        {{ content }}
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { TextColors } from "@/views/dashboard/data";

  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
    activeIndex: { type: String, default: "" },
  });
  const { t } = useI18n();
  const graph = computed(() => props.data.graph || {});
  const dashboardStore = useDashboardStore();
  const appStore = useAppStoreWithOut();
  const content = computed(() => {
    const text = [appStore.durationRow.start, appStore.durationRow.end]
      .map((date: Date) => tf(date, "YYYY-MM-DD HH:mm"))
      .join(` ~ `);
    return text;
  });

  function removeTopo() {
    dashboardStore.removeControls(props.data);
  }
  function editConfig() {
    dashboardStore.setConfigPanel(true);
    dashboardStore.selectWidget(props.data);
  }
  function tf(time: Date, format: any): string {
    const local = {
      dow: 1, // Monday is the first day of the week
      hourTip: t("hourTip"), // tip of select hour
      minuteTip: t("minuteTip"), // tip of select minute
      secondTip: t("secondTip"), // tip of select second
      yearSuffix: t("yearSuffix"), // format of head
      monthsHead: t("monthsHead").split("_"), // months of head
      months: t("months").split("_"), // months of panel
      weeks: t("weeks").split("_"), // weeks
      cancelTip: t("cancel"), // default text for cancel button
      submitTip: t("confirm"), // default text for submit button
      quarterHourCutTip: t("quarterHourCutTip"),
      halfHourCutTip: t("halfHourCutTip"),
      hourCutTip: t("hourCutTip"),
      dayCutTip: t("dayCutTip"),
      weekCutTip: t("weekCutTip"),
      monthCutTip: t("monthCutTip"),
    };
    const year = time.getFullYear();
    const month = time.getMonth();
    const day = time.getDate();
    const hours24 = time.getHours();
    const hours = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const milliseconds = time.getMilliseconds();
    const dd = (t: number) => `0${t}`.slice(-2);
    const map: { [key: string]: string | number } = {
      YYYY: year,
      MM: dd(month + 1),
      MMM: local.months[month],
      MMMM: local.monthsHead[month],
      M: month + 1,
      DD: dd(day),
      D: day,
      HH: dd(hours24),
      H: hours24,
      hh: dd(hours),
      h: hours,
      mm: dd(minutes),
      m: minutes,
      ss: dd(seconds),
      s: seconds,
      S: milliseconds,
    };
    return format.replace(/Y+|M+|D+|H+|h+|m+|s+|S+/g, (str: string) => map[str]);
  }
</script>
<style lang="scss" scoped>
  .time-range {
    font-size: $font-size-smaller;
    height: 100%;
    position: relative;
  }

  .operation {
    cursor: pointer;
  }

  .header {
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .body {
    padding: 0 20px 0 10px;
    width: 100%;
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    overflow: auto;
    font-weight: bold;
  }

  .tools {
    padding: 5px 0;
    color: #999;
    cursor: pointer;
    position: relative;
    text-align: center;

    &:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }
  }
</style>
