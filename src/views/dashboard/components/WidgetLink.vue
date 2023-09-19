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
  <div class="link-content">
    <div>
      <label>{{ t("setDuration") }}</label>
      <el-switch v-model="hasDuration" />
    </div>
    <div v-if="hasDuration">
      <label>{{ t("duration") }}</label>
      <TimePicker :value="duration" position="right" format="YYYY-MM-DD HH:mm" @input="changeTimeRange" />
    </div>
    <div v-else>
      <label>{{ t("auto") }}</label>
      <el-switch class="mr-5" v-model="auto" style="height: 25px" />
      <Selector v-model="freshOpt" :options="RefreshOptions" size="small" />
      <div class="mt-5">
        <label>{{ t("period") }}</label>
        <el-input class="auto-period" size="small" type="number" v-model="period" min="1" />
        <span class="ml-5">{{ t("second") }}</span>
        <i class="ml-10">{{ t("timeReload") }}</i>
      </div>
    </div>
    <el-button size="small" type="primary" class="mt-20" @click="getLink">{{ t("generateLink") }}</el-button>
    <div v-show="widgetLink" class="mt-10">
      <span @click="viewPage" class="link">
        {{ host + widgetLink }}
      </span>
      <span>
        <Icon class="cp ml-10" iconName="copy" @click="copyLink" />
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useSelectorStore } from "@/store/modules/selectors";
  import router from "@/router";
  import copy from "@/utils/copy";
  import { RefreshOptions } from "@/views/dashboard/data";
  import { TimeType } from "@/constants/data";
  import { MetricModes } from "../data";

  const { t } = useI18n();
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();
  const hasDuration = ref<boolean>(false);
  const widgetLink = ref<string>("");
  const dates = ref<Date[]>([]);
  const host = window.location.host;
  const auto = ref<boolean>(true);
  const period = ref<number>(6);
  const freshOpt = ref<string>(RefreshOptions[0].value);
  const duration = ref<string>(JSON.parse(JSON.stringify([appStore.durationRow.start, appStore.durationRow.end])));

  function changeTimeRange(val: Date[] | any) {
    dates.value = val;
  }
  function getLink() {
    if (!dashboardStore.selectedGrid) {
      return;
    }
    const serviceId = selectorStore.currentService ? selectorStore.currentService.id : null;
    const podId = selectorStore.currentPod ? selectorStore.currentPod.id : null;
    const processId = selectorStore.currentProcess ? selectorStore.currentProcess.id : null;
    const destServiceId = selectorStore.currentDestService ? selectorStore.currentDestService.id : null;
    const destPodId = selectorStore.currentDestPod ? selectorStore.currentDestPod.id : null;
    const destProcessId = selectorStore.currentDestProcess ? selectorStore.currentDestProcess.id : null;
    const duration = JSON.stringify({
      start: dates.value[0] ? new Date(dates.value[0]).getTime() : appStore.durationRow.start.getTime(),
      end: dates.value[1] ? new Date(dates.value[1]).getTime() : appStore.durationRow.end.getTime(),
      step: appStore.durationRow.step,
      utc: appStore.utc,
    });
    const { widget, graph, metrics, metricTypes, metricConfig, metricMode, expressions, typesOfMQE, subExpressions } =
      dashboardStore.selectedGrid;
    const c = (metricConfig || []).map((d: any) => {
      const t: any = {};
      if (d.label) {
        t.label = encodeURIComponent(d.label);
      }
      if (d.unit) {
        t.unit = encodeURIComponent(d.unit);
      }
      return { ...d, ...t };
    });
    const opt: any = {
      type: dashboardStore.selectedGrid.type,
      graph: graph,
      metricMode,
      metricConfig: c,
      height: dashboardStore.selectedGrid.h * 20 + 60,
    };
    if (metricMode === MetricModes.Expression) {
      opt.expressions = expressions;
      opt.typesOfMQE = typesOfMQE;
      if (subExpressions && subExpressions.length) {
        opt.subExpressions = subExpressions;
      }
    } else {
      opt.metrics = metrics;
      opt.metricTypes = metricTypes;
    }
    if (widget) {
      opt.widget = {
        title: encodeURIComponent(widget.title || ""),
        tips: encodeURIComponent(widget.tips || ""),
      };
    }
    if (hasDuration.value) {
      opt.auto = 0;
      opt.autoPeriod = 0;
    } else {
      const f = RefreshOptions.filter((d: { value: string }) => d.value === freshOpt.value)[0] || {};
      opt.auto = Number(f.value) * 60 * 1000;
      opt.autoPeriod = period.value;
      if (f.step === TimeType.HOUR_TIME) {
        opt.auto = Number(f.value) * 60 * 60 * 1000;
      }
      if (f.step === TimeType.DAY_TIME) {
        opt.auto = Number(f.value) * 60 * 60 * 60 * 1000;
      }
    }
    const config = JSON.stringify(opt);
    const path = `/page/${dashboardStore.layerId}/${
      dashboardStore.entity
    }/${serviceId}/${podId}/${processId}/${destServiceId}/${destPodId}/${destProcessId}/${encodeURIComponent(config)}`;
    widgetLink.value = hasDuration.value ? `${path}/${encodeURIComponent(duration)}` : path;
  }
  function viewPage() {
    const routeUrl = router.resolve({ path: widgetLink.value });
    window.open(routeUrl.href, "_blank");
  }
  function copyLink() {
    copy(host + widgetLink.value);
  }
</script>
<style lang="scss" scoped>
  .link {
    color: $active-color;
    cursor: pointer;
  }

  .link-content {
    height: 300px;
    font-size: $font-size-smaller;
    overflow: auto;
    padding-bottom: 50px;
  }

  label {
    display: inline-block;
    width: 250px;
  }

  .auto-period {
    width: 50px;
  }
</style>
