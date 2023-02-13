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
  <div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("service") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.serviceCode }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("instance") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.serviceInstanceName }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("endpoint") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.label }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("spanType") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.type }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("component") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.component }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">Peer:</span>
      <span class="g-sm-8 wba">{{ currentSpan.peer || "No Peer" }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("isError") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.isError }}</span>
    </div>
    <h5 class="mb-10" v-if="currentSpan.tags && currentSpan.tags.length"> {{ t("tags") }}. </h5>
    <div class="mb-10 clear item" v-for="i in currentSpan.tags" :key="i.key">
      <span class="g-sm-4 grey">{{ i.key }}:</span>
      <span class="g-sm-8 wba">
        {{ i.value }}
        <span v-if="i.key === 'db.statement' && i.value" class="grey link-hover cp ml-5" @click="copy(i.value)">
          <Icon size="middle" iconName="review-list" />
        </span>
      </span>
    </div>
    <h5 class="mb-10" v-if="currentSpan.logs" v-show="currentSpan.logs.length"> {{ t("logs") }}. </h5>
    <div v-for="(i, index) in currentSpan.logs" :key="index">
      <div class="mb-10 sm">
        <span class="mr-10">{{ t("time") }}:</span>
        <span class="grey">{{ dateFormat(i.time) }}</span>
      </div>
      <div class="mb-15 clear" v-for="(_i, _index) in i.data" :key="_index">
        <div class="mb-10">
          {{ _i.key }}:<span
            v-if="_i.key === 'stack'"
            class="r rk-sidebox-magnify"
            @click="showCurrentSpanDetail(_i.value)"
          >
            <Icon iconName="magnify" />
          </span>
        </div>
        <pre class="pl-15 mt-0 mb-0 sm oa">{{ _i.value }}</pre>
      </div>
    </div>
    <h5 class="mb-10" v-if="attachedEvents.length"> {{ t("events") }}. </h5>
    <div class="timeline-table clear attach-events" v-if="attachedEvents.length">
      <div v-for="(i, index) in attachedEvents" :key="index" class="clear timeline-item" @click="selectEvent(i)">
        <div class="g-sm-3 grey sm hide-xs time-line tr">
          {{ `${visDate(Number(i.endTime))}:${i.endTimeNanos}` }}
        </div>
        <div class="timeline-table-i g-sm-9">
          <div class="message mb-5 b">
            {{ i.event }}
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
            {{ `${visDate(Number(i.endTime))}:${i.endTimeNanos}` }}
          </div>
        </div>
      </div>
    </div>
    <el-button class="popup-btn" type="primary" @click="getTaceLogs">
      {{ t("relatedTraceLogs") }}
    </el-button>
  </div>
  <el-dialog v-model="showEventDetail" :destroy-on-close="true" fullscreen @closed="showEventDetail = false">
    <div>
      <div class="mb-10">
        <span class="grey title">Name:</span>
        {{ currentEvent.event || "" }}
      </div>
      <div class="mb-10">
        <span class="grey title">Start Time:</span>
        {{ currentEvent.startTime ? `${visDate(Number(currentEvent.startTime))}:${currentEvent.startTimeNanos}` : "" }}
      </div>
      <div class="mb-10">
        <span class="grey title">End Time:</span>
        {{ currentEvent.endTime ? `${visDate(Number(currentEvent.endTime))}:${currentEvent.endTimeNanos}` : "" }}
      </div>
      <div class="mb-10">
        <span class="grey title">Summary:</span>
        <div class="mb-5" v-for="(d, index) in currentEvent.summary || []" :key="index" style="white-space: pre-wrap">
          {{ d.key + "=" + d.value }};
        </div>
      </div>
      <div>
        <span class="grey title">Tags:</span>
        <div class="mb-5" v-for="(tag, index) in currentEvent.tags || []" :key="index" style="white-space: pre-wrap">
          {{ tag.key + "=" + tag.value }};
        </div>
      </div>
    </div>
  </el-dialog>
  <el-dialog v-model="showRelatedLogs" :destroy-on-close="true" fullscreen @closed="showRelatedLogs = false">
    <el-pagination
      v-model:currentPage="pageNum"
      v-model:page-size="pageSize"
      :small="true"
      layout="prev, pager, next"
      :pager-count="5"
      :total="total"
      @current-change="turnPage"
    />
    <LogTable :tableData="traceStore.traceSpanLogs || []" :type="`service`" :noLink="true">
      <div class="log-tips" v-if="!traceStore.traceSpanLogs.length">
        {{ t("noData") }}
      </div>
    </LogTable>
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref, computed, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import type { PropType } from "vue";
  import dayjs from "dayjs";
  import copy from "@/utils/copy";
  import { ElMessage } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";
  import { useTraceStore } from "@/store/modules/trace";
  import LogTable from "@/views/dashboard/related/log/LogTable/Index.vue";
  import type { SpanAttachedEvent } from "@/types/trace";

  /*global defineProps */
  const props = defineProps({
    currentSpan: { type: Object as PropType<any>, default: () => ({}) },
  });
  const { t } = useI18n();
  const traceStore = useTraceStore();
  const pageNum = ref<number>(1);
  const showRelatedLogs = ref<boolean>(false);
  const showEventDetail = ref<boolean>(false);
  const attachedEvents = ref<any[]>([]);
  const currentEvent = ref<any>({});
  const pageSize = 10;
  const total = computed(() =>
    traceStore.traceList.length === pageSize ? pageSize * pageNum.value + 1 : pageSize * pageNum.value,
  );
  const visDate = (date: any, pattern = "YYYY-MM-DD HH:mm:ss:SSS") => dayjs(date).format(pattern);

  onMounted(() => {
    visTimeline();
  });
  async function getTaceLogs() {
    showRelatedLogs.value = true;
    const res = await traceStore.getSpanLogs({
      condition: {
        relatedTrace: {
          traceId: props.currentSpan.traceId,
          segmentId: props.currentSpan.segmentId,
          spanId: props.currentSpan.spanId,
        },
        paging: { pageNum: pageNum.value, pageSize },
      },
    });
    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }
  function visTimeline() {
    attachedEvents.value = (props.currentSpan.attachedEvents || [])
      .map((d: SpanAttachedEvent, index: number) => {
        let startTimeNanos = String(d.startTime.nanos).slice(-6).padStart(6, "0");
        let endTimeNanos = String(d.endTime.nanos).slice(-6).padStart(6, "0");
        endTimeNanos = toString(endTimeNanos);
        startTimeNanos = toString(startTimeNanos);
        return {
          id: index + 1,
          content: d.event,
          ...d,
          startTime: d.startTime.seconds * 1000 + d.startTime.nanos / 1000000,
          endTime: d.endTime.seconds * 1000 + d.endTime.nanos / 1000000,
          className: "Normal",
          startTimeNanos,
          endTimeNanos,
          scope: "Service",
        };
      })
      .reverse();
  }
  function selectEvent(event: SpanAttachedEvent) {
    currentEvent.value = event;
    showEventDetail.value = true;
  }
  function toString(str: string) {
    return str.replace(/\d(?=(\d{3})+$)/g, "$&,");
  }
  function turnPage(p: number) {
    pageNum.value = p;
    getTaceLogs();
  }
  function showCurrentSpanDetail(text: string) {
    copy(text);
  }
</script>
<style lang="scss" scoped>
  @import "../../../../../components/style.scss";

  .title {
    display: inline-block;
    width: 70px;
  }

  .timeline-table {
    padding: 0;
  }

  .time-line {
    padding: 0;
    max-width: 260px;
    padding-top: 19px;
  }

  .attach-events {
    width: 100%;
    margin: 0 5px 5px 0;
    height: 400px;
  }

  .popup-btn {
    color: #fff;
    margin-top: 40px;
    width: 100%;
    text-align: center;
  }

  .item span {
    min-height: 21px;
  }

  .link-hover {
    cursor: pointer;
  }

  .link-hover:hover {
    color: #448dfe;
  }
</style>
