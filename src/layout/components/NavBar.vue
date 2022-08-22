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
  <div class="nav-bar flex-h">
    <div class="title">{{ appStore.pageTitle || t(pageName) }}</div>
    <div class="app-config">
      <span class="red" v-show="timeRange">{{ t("timeTips") }}</span>
      <TimePicker
        :value="time"
        position="bottom"
        format="YYYY-MM-DD HH:mm"
        @input="changeTimeRange"
      />
      <span>
        UTC{{ appStore.utcHour >= 0 ? "+" : ""
        }}{{ `${appStore.utcHour}:${appStore.utcMin}` }}
      </span>
      <span title="refresh" class="ghost ml-5 cp" @click="handleReload">
        <Icon iconName="retry" :loading="appStore.autoRefresh" class="middle" />
      </span>
      <span class="version ml-5 cp">
        <el-popover
          trigger="hover"
          width="250"
          placement="bottom"
          effect="light"
          :content="appStore.version"
        >
          <template #reference>
            <span>
              <Icon iconName="info_outline" size="middle" />
            </span>
          </template>
        </el-popover>
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import timeFormat from "@/utils/timeFormat";
import { useAppStoreWithOut } from "@/store/modules/app";
import { ElMessage } from "element-plus";
import getLocalTime from "@/utils/localtime";

const { t } = useI18n();
const appStore = useAppStoreWithOut();
const route = useRoute();
const pageName = ref<string>("");
const timeRange = ref<number>(0);
const time = ref<Date[]>([
  appStore.durationRow.start,
  appStore.durationRow.end,
]);

resetDuration();
getVersion();
const setConfig = (value: string) => {
  pageName.value = value || "";
};

const handleReload = () => {
  const gap =
    appStore.duration.end.getTime() - appStore.duration.start.getTime();
  const dates: Date[] = [
    getLocalTime(appStore.utc, new Date(new Date().getTime() - gap)),
    getLocalTime(appStore.utc, new Date()),
  ];
  appStore.setDuration(timeFormat(dates));
};
function changeTimeRange(val: Date[] | any) {
  timeRange.value =
    val[1].getTime() - val[0].getTime() > 60 * 24 * 60 * 60 * 1000 ? 1 : 0;
  if (timeRange.value) {
    return;
  }
  appStore.setDuration(timeFormat(val));
}
setConfig(String(route.meta.title));
watch(
  () => route.meta.title,
  (title: unknown) => {
    setConfig(String(title));
  }
);
async function getVersion() {
  const res = await appStore.fetchVersion();
  if (res.errors) {
    ElMessage.error(res.errors);
  }
}
function resetDuration() {
  const { duration }: any = route.params;
  if (duration) {
    const d = JSON.parse(duration);

    appStore.updateDurationRow({
      start: new Date(d.start),
      end: new Date(d.end),
      step: d.step,
    });
    appStore.updateUTC(d.utc);
    time.value = [new Date(d.start), new Date(d.end)];
  }
}
</script>
<style lang="scss" scoped>
.nav-bar {
  padding: 5px 10px 5px 28px;
  text-align: left;
  justify-content: space-between;
  background-color: #fafbfc;
  border-bottom: 1px solid #dfe4e8;
  color: #222;
  font-size: 12px;
}

.nav-bar.dark {
  background-color: #333840;
  border-bottom: 1px solid #252a2f;
  color: #fafbfc;
}

.title {
  font-size: 14px;
  font-weight: 500;
  height: 28px;
  line-height: 28px;
}

.nav-tabs {
  padding: 10px;
}
</style>
