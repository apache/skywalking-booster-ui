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
import { Event } from "@/types/events";
import { LayoutConfig } from "@/types/dashboard";
import { useEventStore } from "@/store/modules/event";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";
import { useDashboardStore } from "@/store/modules/dashboard";
import getDashboard from "@/hooks/useDashboardsSession";
import { dateFormatTime } from "@/utils/dateFormat";
import { useAppStoreWithOut } from "@/store/modules/app";

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
const visDate = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);

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
    const all = getDashboard(dashboardStore.currentDashboard).widgets;
    const widgets = all.filter(
      (d: { value: string; label: string } & LayoutConfig) => {
        const isLinear = ["Bar", "Line", "Area"].includes(
          (d.graph && d.graph.type) || ""
        );
        if (isLinear) {
          return d;
        }
      }
    );
    const index = properties.items[0];
    const i = events[index - 1 || 0];

    for (const widget of widgets) {
      let end = i.end;
      if (!isNaN(index)) {
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
        if (!i.end || i.end.getTime() - i.start.getTime() < diff) {
          end = i.start.getTime() + diff;
        }
      }
      const startTime = dateFormatTime(i.start, appStore.duration.step);
      const endTime = dateFormatTime(new Date(end), appStore.duration.step);
      widget.filters = {
        sourceId: dashboardStore.selectedGrid.id || "",
        isRange: true,
        duration: {
          startTime,
          endTime,
        },
      };
      dashboardStore.setWidget(widget);
    }
  });
}
function resize() {
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const cr = entry.contentRect;
    if (
      Math.abs(cr.width - oldVal.value.width) < 3 &&
      Math.abs(cr.height - oldVal.value.height) < 3
    ) {
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
  }
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
