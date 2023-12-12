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
  <div ref="timeline" class="events"></div>
</template>
<script lang="ts" setup>
  import { ref, watch, onMounted } from "vue";
  import dayjs from "dayjs";
  import { useThrottleFn } from "@vueuse/core";
  import type { Event } from "@/types/events";
  import type { LayoutConfig } from "@/types/dashboard";
  import { useEventStore } from "@/store/modules/event";
  import { DataSet, Timeline } from "vis-timeline/standalone";
  import "vis-timeline/styles/vis-timeline-graph2d.css";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import getDashboard from "@/hooks/useDashboardsSession";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import dateFormatStep, { dateFormatTime } from "@/utils/dateFormat";
  import getLocalTime from "@/utils/localtime";
  import { WidgetType } from "@/views/dashboard/data";

  const eventStore = useEventStore();
  /*global defineProps, Nullable */
  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
  });
  const timeline = ref<Nullable<HTMLDivElement>>(null);
  const visGraph = ref<Nullable<any>>(null);
  const oldVal = ref<{ width: number; height: number }>({ width: 0, height: 0 });
  const dashboardStore = useDashboardStore();
  const appStore = useAppStoreWithOut();
  const visDate = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") => dayjs(date).format(pattern);

  onMounted(() => {
    oldVal.value = (timeline.value && timeline.value.getBoundingClientRect()) || {
      width: 0,
      height: 0,
    };
    useThrottleFn(resize, 500)();
  });

  function visTimeline() {
    if (!timeline.value) {
      return;
    }
    if (visGraph.value) {
      visGraph.value.destroy();
    }
    const h = timeline.value.getBoundingClientRect().height;
    const events = eventStore.events.map((d: Event, index: number) => {
      return {
        id: index + 1,
        content: d.name,
        start: new Date(Number(d.startTime)),
        end: new Date(Number(d.endTime)),
        data: d,
        className: d.type,
      };
    });
    const items: any = new DataSet(events);
    const options: any = {
      height: h,
      width: "100%",
      locale: "en",
      groupHeightMode: "fitItems",
      autoResize: false,
      tooltip: {
        overflowMethod: "cap",
        template(item: Event | any) {
          const data = item.data || {};
          let tmp = `<div>ID: ${data.uuid || ""}</div>
        <div>Name: ${data.name || ""}</div>
        <div>Event Type: ${data.type || ""}</div>
        <div>Start Time: ${data.startTime ? visDate(data.startTime) : ""}</div>
        <div>End Time: ${data.endTime ? visDate(data.endTime) : ""}</div>
        <div>Message: ${data.message || ""}</div>
        <div>Service: ${data.source.service || ""}</div>`;
          if (data.source.endpoint) {
            tmp += `<div>Endpoint: ${data.source.endpoint}</div>`;
          }
          if (data.source.instance) {
            tmp += `<div>Service Instance: ${data.source.instance}</div>`;
          }
          return tmp;
        },
      },
    };
    visGraph.value = new Timeline(timeline.value, items, options);
    visGraph.value.on("select", (properties: { items: number[] }) => {
      if (!props.data.eventAssociate) {
        return;
      }
      dashboardStore.selectWidget(props.data);
      const dashboard = getDashboard(dashboardStore.currentDashboard).widgets;
      associateMetrics(properties.items, events, dashboard);
      associateTraceLog(properties.items, events, dashboard);
    });
  }
  function associateTraceLog(
    items: number[],
    events: {
      id: number;
      content: string;
      start: Date;
      end: Date;
      data: unknown;
      className: string;
    }[],
    dashboard: LayoutConfig[],
  ) {
    const widgets = dashboard.filter((d: { type: string }) =>
      ([WidgetType.Trace, WidgetType.Log] as string[]).includes(d.type),
    );
    const index = items[0];
    const i = events[index - 1 || 0];
    for (const widget of widgets) {
      if (isNaN(index)) {
        const item = {
          ...widget,
          filters: {
            sourceId: props.data.id || "",
            duration: null,
          },
        };
        dashboardStore.setWidget(item);
      } else {
        let step = appStore.duration.step;
        let start = i.start;
        let end = i.end;
        if (appStore.duration.step === "MINUTE" && i.end.getTime() - i.start.getTime() < 60000) {
          step = "SECOND";
        } else {
          const times = setEndTime(i.start, i.end);
          start = times.start;
          end = times.end;
        }
        const item = {
          ...widget,
          filters: {
            sourceId: props.data.id || "",
            duration: {
              start: dateFormatStep(getLocalTime(appStore.utc, start), step, true),
              end: dateFormatStep(getLocalTime(appStore.utc, end), step, true),
              step,
            },
          },
        };
        dashboardStore.setWidget(item);
      }
    }
  }
  function associateMetrics(
    items: number[],
    events: {
      id: number;
      content: string;
      start: Date;
      end: Date;
      data: unknown;
      className: string;
    }[],
    dashboard: LayoutConfig[],
  ) {
    const widgets = dashboard.filter((d: LayoutConfig) => {
      const isLinear = ["Bar", "Line", "Area"].includes((d.graph && d.graph.type) || "");
      if (isLinear) {
        return d;
      }
    });
    const index = items[0];
    const i = events[index - 1 || 0];

    for (const widget of widgets) {
      if (isNaN(index)) {
        const item = {
          ...widget,
          filters: {
            sourceId: dashboardStore.selectedGrid.id || "",
            isRange: true,
            duration: {
              startTime: null,
              endTime: null,
            },
          },
        };
        dashboardStore.setWidget(item);
      } else {
        const { start, end } = setEndTime(i.start, i.end);
        const startTime = dateFormatTime(start, appStore.duration.step);
        const endTime = dateFormatTime(end, appStore.duration.step);
        const item = {
          ...widget,
          filters: {
            sourceId: dashboardStore.selectedGrid.id || "",
            isRange: true,
            duration: {
              startTime,
              endTime,
            },
          },
        };
        dashboardStore.setWidget(item);
      }
    }
  }
  function setEndTime(start: Date, end: Date) {
    let time: Date | number = end;
    let diff = 60000;
    switch (appStore.duration.step) {
      case "MINUTE":
        diff = 60000;
        break;
      case "HOUR":
        diff = 3600000;
        break;
      case "DAY":
        diff = 3600000 * 24;
        break;
    }
    if (!end || end.getTime() - start.getTime() < diff) {
      time = start.getTime() + diff;
    }
    return { start, end: new Date(time) };
  }

  function resize() {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const cr = entry.contentRect;
      if (Math.abs(cr.width - oldVal.value.width) < 3 && Math.abs(cr.height - oldVal.value.height) < 3) {
        return;
      }
      visTimeline();
      oldVal.value = { width: cr.width, height: cr.height };
    });
    if (timeline.value) {
      observer.observe(timeline.value);
    }
  }
  watch(
    () => eventStore.events,
    () => {
      visTimeline();
    },
  );
</script>
<style lang="scss" scoped>
  .events {
    width: calc(100% - 5px);
    margin: 0 5px 5px 0;
    height: 100%;
    min-height: 150px;
  }

  .message {
    max-width: 400px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
