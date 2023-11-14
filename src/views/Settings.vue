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
  <div class="settings">
    <div class="flex-h item">
      <span class="label">{{ t("language") }}</span>
      <Selector
        v-model="lang"
        :options="Languages"
        placeholder="Select a language"
        @change="setLang"
        size="small"
        style="font-size: 14px"
      />
    </div>
    <div class="flex-h item">
      <span class="label">{{ t("serverZone") }}</span>
      <div>
        <span>UTC</span>
        <span class="ml-5 mr-5">{{ utcHour >= 0 ? "+" : "" }}</span>
        <input type="number" v-model="utcHour" min="-12" max="14" class="utc-input" @change="setUTCHour" />
        <span class="ml-5 mr-5">:</span>
        <span class="utc-min">{{ utcMin > 9 || utcMin === 0 ? null : 0 }}</span>
        <input type="number" v-model="utcMin" min="0" max="59" class="utc-input" @change="setUTCMin" />
      </div>
    </div>
    <div class="flex-h item">
      <span class="label">{{ t("auto") }}</span>
      <el-switch v-model="auto" @change="handleAuto" style="height: 25px" />
      <div class="auto-time ml-5">
        <span class="auto-select">
          <input type="number" v-model="autoTime" @change="changeAutoTime" min="1" />
        </span>
        {{ t("second") }}
        <i class="ml-10">{{ t("timeReload") }}</i>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import timeFormat from "@/utils/timeFormat";
  import { Languages } from "@/constants/data";
  import Selector from "@/components/Selector.vue";
  import getLocalTime from "@/utils/localtime";

  const { t, locale } = useI18n();
  const appStore = useAppStoreWithOut();
  const lang = ref<string>(locale.value || "en");
  const autoTime = ref<number>(6);
  const auto = ref<boolean>(appStore.autoRefresh || false);
  const utcHour = ref<number>(appStore.utcHour);
  const utcMin = ref<number>(appStore.utcMin);

  const handleReload = () => {
    const gap = appStore.duration.end.getTime() - appStore.duration.start.getTime();
    const dates: Date[] = [
      getLocalTime(appStore.utc, new Date(new Date().getTime() - gap)),
      getLocalTime(appStore.utc, new Date()),
    ];
    appStore.setDuration(timeFormat(dates));
  };
  const handleAuto = () => {
    if (autoTime.value < 1) {
      return;
    }
    appStore.setAutoRefresh(auto.value);
    if (auto.value) {
      handleReload();
      appStore.setReloadTimer(setInterval(handleReload, autoTime.value * 1000));
    } else {
      if (appStore.reloadTimer) {
        clearInterval(appStore.reloadTimer);
      }
    }
  };
  const changeAutoTime = () => {
    if (autoTime.value < 1) {
      return;
    }
    if (appStore.reloadTimer) {
      clearInterval(appStore.reloadTimer);
    }
    if (auto.value) {
      handleReload();
      appStore.setReloadTimer(setInterval(handleReload, autoTime.value * 1000));
    }
  };
  const setLang = (): void => {
    locale.value = lang.value;
    window.localStorage.setItem("language", lang.value);
  };
  const setUTCHour = () => {
    if (utcHour.value < -12) {
      utcHour.value = -12;
    }
    if (utcHour.value > 14) {
      utcHour.value = 14;
    }
    if (isNaN(utcHour.value)) {
      utcHour.value = 0;
    }
    appStore.setUTC(utcHour.value, utcMin.value);
  };
  const setUTCMin = () => {
    if (utcMin.value < 0) {
      utcMin.value = 0;
    }
    if (utcMin.value > 59) {
      utcMin.value = 59;
    }
    if (isNaN(utcMin.value)) {
      utcMin.value = 0;
    }
    appStore.setUTC(utcHour.value, utcMin.value);
  };
</script>
<style lang="scss" scoped>
  .utc-input {
    color: inherit;
    background: 0;
    border: 0;
    outline: none;
    padding-bottom: 0;
  }

  .utc-min {
    display: inline-block;
    padding-top: 2px;
  }

  .auto-select {
    border-radius: 3px;
    background-color: $theme-background;
    padding: 1px;

    input {
      width: 38px;
      border-style: unset;
      outline: 0;
    }
  }

  .settings {
    color: var(--sw-setting-color);
    font-size: 13px;
    padding: 20px;

    .item {
      margin-top: 10px;
    }

    input {
      outline: 0;
      width: 50px;
      border-radius: 3px;
      border: 1px solid $disabled-color;
      text-align: center;
      height: 25px;
    }

    .label {
      width: 180px;
      display: inline-block;
      font-weight: 500;
      color: $font-color;
      line-height: 25px;
    }
  }
</style>
