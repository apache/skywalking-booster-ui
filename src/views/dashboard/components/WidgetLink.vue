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
    <div class="time-range" v-if="hasDuration">
      <label class="mr-20">{{ t("duration") }}</label>
      <TimePicker
        :value="[appStore.durationRow.start, appStore.durationRow.end]"
        position="bottom"
        format="YYYY-MM-DD HH:mm"
        @input="changeTimeRange"
      />
    </div>
    <el-button size="small" type="primary" class="mt-10" @click="getLink">{{ t("generateLink") }}</el-button>
    <div v-show="widgetLink" class="link mt-10" @click="viewPage">{{ host + widgetLink }}</div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useSelectorStore } from "@/store/modules/selectors";
  import router from "@/router";

  const { t } = useI18n();
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const selectorStore = useSelectorStore();
  const hasDuration = ref<boolean>(false);
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
      start: dates.value[0] || appStore.duration.start,
      end: dates.value[1] || appStore.duration.end,
      step: appStore.duration.step,
      utc: appStore.utc,
    });
    const config = JSON.stringify({
      type: dashboardStore.selectedGrid.type,
      widget: dashboardStore.selectedGrid.widget,
      graph: dashboardStore.selectedGrid.graph,
      metrics: dashboardStore.selectedGrid.metrics,
      metricTypes: dashboardStore.selectedGrid.metricTypes,
    });
    widgetLink.value = hasDuration.value
      ? `/page/${dashboardStore.entity}/${serviceId}/${podId}/${processId}/${destServiceId}/${destPodId}/${destProcessId}/${config}/${duration}`
      : `/page/${dashboardStore.entity}/${serviceId}/${podId}/${processId}/${destServiceId}/${destPodId}/${destProcessId}/${config}`;
  }
  function viewPage() {
    const routeUrl = router.resolve({ path: widgetLink.value });
    window.open(routeUrl.href, "_blank");
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

  .time-range {
    margin-bottom: 20px;
  }
</style>
