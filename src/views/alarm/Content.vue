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
  <div class="timeline-table clear">
    <div
      v-for="(i, index) in alarmStore.alarms"
      :key="index"
      class="mb-10 clear timeline-item"
      @click="showDetails(i)"
    >
      <div class="g-sm-3 grey sm hide-xs time-line tr">
        {{ dateFormat(parseInt(i.startTime)) }}
      </div>
      <div class="timeline-table-i g-sm-9">
        <div class="message mb-5 b">
          {{ i.message }}
        </div>
        <div
          class="timeline-table-i-scope mr-10 l sm"
          :class="{
            blue: i.scope === 'Service',
            green: i.scope === 'Endpoint',
            yellow: i.scope === 'ServiceInstance',
          }"
        >
          {{ t(i.scope.toLowerCase()) }}
        </div>
        <div class="grey sm show-xs">
          {{ dateFormat(parseInt(i.startTime)) }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
import { Alarm } from "@/types/alarm";
import { useAlarmStore } from "@/store/modules/alarm";

const { t } = useI18n();
const alarmStore = useAlarmStore();
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);
const currentDetail = ref<Alarm | any>({});
const alarmTags = ref<string[]>([]);

function showDetails(item: Alarm) {
  currentDetail.value = item;
  alarmTags.value = currentDetail.value.tags.map(
    (d: { key: string; value: string }) => {
      return `${d.key} = ${d.value}`;
    }
  );
}
</script>
<style lang="scss">
@import "./index.scss";
</style>
