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
    <div v-for="(i, index) in alarmStore.alarms" :key="index" class="clear timeline-item">
      <div class="g-sm-3 grey sm hide-xs time-line tr">
        {{ dateFormat(parseInt(i.startTime)) }}
      </div>
      <div class="timeline-table-i g-sm-9" @click="showDetails(i)">
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
    <div v-if="!alarmStore.alarms.length" class="tips">{{ t("noData") }}</div>
  </div>
  <el-dialog
    v-model="isShowDetails"
    :title="t('alarmDetail')"
    fullscreen
    :destroy-on-close="true"
    @closed="isShowDetails = false"
  >
    <div class="mb-10 clear alarm-detail" v-for="(item, index) in AlarmDetailCol" :key="index">
      <span class="g-sm-2 grey">{{ t(item.value) }}:</span>
      <span v-if="item.label === 'startTime'">
        {{ dateFormat(currentDetail[item.label]) }}
      </span>
      <span v-else-if="item.label === 'tags'">
        <div v-for="(d, index) in alarmTags" :key="index">{{ d }}</div>
      </span>
      <span v-else-if="item.label === 'events'" class="event-detail">
        <div>
          <ul>
            <li>
              <span v-for="(i, index) of EventsDetailHeaders" :class="i.class" :key="i.class + index">
                {{ t(i.text) }}
              </span>
            </li>
            <li v-for="event in currentEvents" :key="event.uuid" @click="viewEventDetail(event)">
              <span v-for="(d, index) of EventsDetailHeaders" :class="d.class" :key="event.uuid + index">
                <span v-if="d.class === 'startTime' || d.class === 'endTime'">
                  {{ dateFormat(event[d.class]) }}
                </span>
                <span v-else>
                  {{ event[d.class] }}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </span>
      <span v-else>{{ currentDetail[item.label] }}</span>
    </div>
  </el-dialog>
  <el-dialog
    v-model="showEventDetails"
    :title="t('eventDetail')"
    fullscreen
    :destroy-on-close="true"
    @closed="showEventDetails = false"
  >
    <div class="event-detail">
      <div class="mb-10" v-for="(eventKey, index) in EventsDetailKeys" :key="index">
        <span class="keys">{{ t(eventKey.text) }}</span>
        <span v-if="eventKey.class === 'parameters'">
          <span v-for="(d, index) of currentEvent[eventKey.class]" :key="index"> {{ d.key }}={{ d.value }}; </span>
        </span>
        <span v-else-if="eventKey.class === 'startTime' || eventKey.class === 'endTime'">
          {{ dateFormat(currentEvent[eventKey.class]) }}
        </span>
        <span v-else-if="eventKey.class === 'source'" class="source">
          <span>{{ t("service") }}: {{ currentEvent[eventKey.class].service }}</span>
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
  import type { Alarm, Event } from "@/types/alarm";
  import { useAlarmStore } from "@/store/modules/alarm";
  import { EventsDetailHeaders, AlarmDetailCol, EventsDetailKeys } from "./data";
  import { dateFormat } from "@/utils/dateFormat";

  const { t } = useI18n();
  const alarmStore = useAlarmStore();
  const isShowDetails = ref<boolean>(false);
  const showEventDetails = ref<boolean>(false);
  const currentDetail = ref<Alarm | any>({});
  const alarmTags = ref<string[]>([]);
  const currentEvents = ref<any[]>([]);
  const currentEvent = ref<Event | any>({});

  function showDetails(item: Alarm) {
    isShowDetails.value = true;
    currentDetail.value = item;
    currentEvents.value = item.events;
    alarmTags.value = currentDetail.value.tags.map((d: { key: string; value: string }) => {
      return `${d.key} = ${d.value}`;
    });
  }

  function viewEventDetail(event: Event) {
    currentEvent.value = event;
    showEventDetails.value = true;
  }
</script>
<style lang="scss" scoped>
  .timeline-table {
    padding: 30px 20px 20px 40px;
    flex-grow: 1;
    overflow: auto;
    height: 100%;
  }

  .time-line {
    padding: 14px 30px;
    min-height: 63px;
    max-width: 132px;
  }

  .timeline-table-i {
    padding: 10px 15px;
    border-left: 4px solid var(--border-color-primary);
    position: relative;

    &::after {
      content: "";
      display: inline-block;
      position: absolute;
      width: 7px;
      height: 7px;
      left: -23px;
      top: 25px;
      border-radius: 4px;
      background-color: #448dfe;
    }

    &::before {
      content: "";
      display: inline-block;
      position: absolute;
      width: 1px;
      height: calc(100% + 11px);
      top: 0;
      left: -20px;
      border-radius: 5px;
      background-color: #448dfe99;
    }
  }

  .timeline-table-i-scope {
    display: inline-block;
    padding: 0 8px;
    border: 1px solid;
    margin-top: -1px;
    border-radius: 4px;
  }

  .timeline-item {
    cursor: pointer;
    margin-bottom: 9px;
  }

  .keys {
    font-weight: bold;
    display: inline-block;
    width: 120px;
  }

  .source > span {
    display: inline-block;
  }

  .source > div {
    padding-left: 120px;
  }

  .uuid {
    width: 280px;
  }

  .tips {
    width: 100%;
    margin: 20px 0;
    text-align: center;
    font-size: $font-size-normal;
  }

  .alarm-detail {
    max-height: 600px;
    overflow: auto;

    ul {
      min-height: 100px;
      overflow: auto;
      margin-bottom: 20px;
    }

    li {
      cursor: pointer;

      > span {
        width: 160px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        display: inline-block;
        border-bottom: 1px solid $disabled-color;
        overflow: hidden;
      }
    }
  }
</style>
