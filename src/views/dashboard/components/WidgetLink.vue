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
      <label class="mr-5">{{ t("setDuration") }}</label>
      <el-switch v-model="hasDuration" />
    </div>
    <div v-if="hasDuration">
      <label class="mr-20">{{ t("duration") }}</label>
      <TimePicker
        :value="[appStore.durationRow.start, appStore.durationRow.end]"
        position="bottom"
        format="YYYY-MM-DD HH:mm"
        @input="changeTimeRange"
      />
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

  const { t } = useI18n();
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();
  const hasDuration = ref<boolean>(true);
  const widgetLink = ref<string>("");
  const dates = ref<Date[]>([]);
  const host = window.location.host;

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
    const w = {
      title: encodeURIComponent(dashboardStore.selectedGrid.widget.title),
      tips: encodeURIComponent(dashboardStore.selectedGrid.widget.tips),
    };
    const metricConfig = (dashboardStore.selectedGrid.metricConfig || []).map((d: any) => {
      if (d.label) {
        d.label = encodeURIComponent(d.label);
      }
      if (d.unit) {
        d.unit = encodeURIComponent(d.unit);
      }
      return d;
    });
    const config = JSON.stringify({
      type: dashboardStore.selectedGrid.type,
      widget: w,
      graph: dashboardStore.selectedGrid.graph,
      metrics: dashboardStore.selectedGrid.metrics,
      metricTypes: dashboardStore.selectedGrid.metricTypes,
      metricConfig: metricConfig,
      height: dashboardStore.selectedGrid.h * 20 + 60,
    });
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
    color: #409eff;
    cursor: pointer;
  }

  .link-content {
    height: 300px;
    font-size: 12px;
  }
</style>
