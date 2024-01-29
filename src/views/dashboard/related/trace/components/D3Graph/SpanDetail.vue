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
    <h5 class="mb-10" v-if="diffRefs.length"> {{ t("traceID") }}. </h5>
    <div class="mb-10 clear item" v-for="item in diffRefs" :key="item.traceId">
      <span class="g-sm-12 wba cp link" @click="viewRelateTrace(item)">
        {{ item.traceId }}
      </span>
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
    <h5 class="mb-10" v-if="currentSpan.attachedEvents && currentSpan.attachedEvents.length"> {{ t("events") }}. </h5>
    <div
      class="attach-events"
      ref="eventGraph"
      v-if="currentSpan.attachedEvents && currentSpan.attachedEvents.length"
    ></div>
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
      v-model="pageNum"
      :page-size="pageSize"
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
  import { ref, computed, onMounted, inject } from "vue";
  import { useI18n } from "vue-i18n";
  import type { PropType } from "vue";
  import dayjs from "dayjs";
  import ListGraph from "../../utils/d3-trace-list";
  import copy from "@/utils/copy";
  import { ElMessage } from "element-plus";
  import { dateFormat } from "@/utils/dateFormat";
  import { useTraceStore } from "@/store/modules/trace";
  import LogTable from "@/views/dashboard/related/log/LogTable/Index.vue";
  import type { SpanAttachedEvent } from "@/types/trace";
  import getDashboard from "@/hooks/useDashboardsSession";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { WidgetType } from "@/views/dashboard/data";
  import type { LayoutConfig } from "@/types/dashboard";

  /*global defineProps, Nullable, Recordable */
  const props = defineProps({
    currentSpan: { type: Object as PropType<Recordable>, default: () => ({}) },
    traceId: { type: String, default: "" },
  });
  const options: Recordable<LayoutConfig> = inject("options") || {};
  const { t } = useI18n();
  const traceStore = useTraceStore();
  const dashboardStore = useDashboardStore();
  const pageNum = ref<number>(1);
  const showRelatedLogs = ref<boolean>(false);
  const showEventDetail = ref<boolean>(false);
  const currentEvent = ref<Recordable>({});
  const pageSize = 10;
  const total = computed(() =>
    traceStore.traceList.length === pageSize ? pageSize * pageNum.value + 1 : pageSize * pageNum.value,
  );
  const diffRefs = computed(() =>
    props.currentSpan.refs.filter((d: Recordable) => d.traceId !== props.currentSpan.traceId),
  );
  const tree = ref<any>(null);
  const eventGraph = ref<Nullable<HTMLDivElement>>(null);
  const visDate = (date: number, pattern = "YYYY-MM-DD HH:mm:ss:SSS") => dayjs(date).format(pattern);

  onMounted(() => {
    setTimeout(() => {
      visTimeline();
    }, 500);
  });
  async function getTaceLogs() {
    showRelatedLogs.value = true;
    const res = await traceStore.getSpanLogs({
      condition: {
        relatedTrace: {
          traceId: props.currentSpan.traceId || props.traceId,
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
    if (!eventGraph.value) {
      return;
    }
    const attachedEvents = props.currentSpan.attachedEvents || [];
    const events: any[] = attachedEvents
      .map((d: SpanAttachedEvent) => {
        let startTimeNanos = String(d.startTime.nanos).slice(-6).padStart(6, "0");
        let endTimeNanos = String(d.endTime.nanos).slice(-6).padStart(6, "0");
        endTimeNanos = toString(endTimeNanos);
        startTimeNanos = toString(startTimeNanos);
        const startTime = d.startTime.seconds * 1000 + d.startTime.nanos / 1000000;
        const endTime = d.endTime.seconds * 1000 + d.endTime.nanos / 1000000;
        return {
          label: d.event,
          ...d,
          startTime,
          endTime,
          startTimeNanos,
          endTimeNanos,
        };
      })
      .sort((a: { startTime: number; endTime: number }, b: { startTime: number; endTime: number }) => {
        return a.startTime - b.startTime;
      });

    tree.value = new ListGraph(eventGraph.value, selectEvent);
    tree.value.init(
      {
        children: events,
        label: "",
      },
      events,
      0,
    );
    tree.value.draw();
  }

  function viewRelateTrace(item: Recordable) {
    const { associationWidget } = getDashboard(dashboardStore.currentDashboard);
    associationWidget(
      (options.id as any) || "",
      {
        sourceId: options.id || "",
        traceId: item.traceId || "",
        id: "0",
      },
      WidgetType.Trace,
    );
  }

  function selectEvent(i: any) {
    currentEvent.value = i.data;
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
  .title {
    display: inline-block;
    width: 70px;
  }

  .attach-events {
    width: 100%;
    margin: 0 5px 5px 0;
    height: 400px;
    overflow: auto;
  }

  .popup-btn {
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

  .link,
  .link-hover:hover {
    color: var(--el-color-primary);
  }

  .link {
    text-decoration: underline;
  }
</style>
