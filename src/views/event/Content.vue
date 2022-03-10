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
      v-for="(i, index) in eventStore.events"
      :key="index"
      class="mb-10 clear timeline-item"
      @click="showEventDetails(i)"
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
          {{ i.scope }}
        </div>
        <div class="grey sm show-xs">
          {{ dateFormat(parseInt(i.startTime)) }}
        </div>
      </div>
    </div>
    <div v-if="!eventStore.events.length" class="tips">{{ t("noData") }}</div>
  </div>
  <el-dialog
    :title="t('eventDetail')"
    v-model="showDetails"
    fullscreen
    :destroy-on-close="true"
    @closed="showDetails = false"
  >
    <div>
      <div
        class="mb-10"
        v-for="(eventKey, index) in EventsDetailKeys"
        :key="index"
      >
        <span class="keys">{{ t(eventKey.text) }}</span>
        <span v-if="eventKey.class === 'parameters'">
          <span v-for="(d, index) of currentEvent[eventKey.class]" :key="index"
            >{{ d.key }}={{ d.value }};
          </span>
        </span>
        <span
          v-else-if="
            eventKey.class === 'startTime' || eventKey.class === 'endTime'
          "
          >{{ dateFormat(currentEvent[eventKey.class]) }}</span
        >
        <span v-else-if="eventKey.class === 'source'" class="source">
          <span
            >{{ t("service") }}:
            {{ currentEvent[eventKey.class].service }}</span
          >
          <div v-show="currentEvent[eventKey.class].endpoint">
            {{ t("endpoint") }}:
            {{ currentEvent[eventKey.class].endpoint }}
          </div>
          <div v-show="currentEvent[eventKey.class].serviceInstance">
            {{ t("instance") }}:
            {{ currentEvent[eventKey.class].serviceInstance }}
          </div>
        </span>
        <span v-else>{{ currentEvent[eventKey.class] }}</span>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";
import { useEventStore } from "@/store/modules/event";
import { EventsDetailKeys } from "./data";
import { Event } from "@/types/events";

const { t } = useI18n();
const eventStore = useEventStore();
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);
const showDetails = ref<boolean>(false);
const currentEvent = ref<any>({});

function showEventDetails(item: Event) {
  showDetails.value = true;
  currentEvent.value = item;
}
</script>
<style lang="scss" scoped>
@import "../components/style.scss";

.tips {
  width: 100%;
  margin: 20px 0;
  text-align: center;
  font-size: 14px;
}
</style>
