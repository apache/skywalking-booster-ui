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
import { ref, watch } from "vue";
import dayjs from "dayjs";
import { useEventStore } from "@/store/modules/event";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.css";
const eventStore = useEventStore();
/*global Nullable */
const timeline = ref<Nullable<HTMLDivElement>>(null);
const visGraph = ref<Nullable<any>>(null);
const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  new Date(dayjs(date).format(pattern));
const visDate = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
  dayjs(date).format(pattern);

function visTimeline() {
  if (!timeline.value) {
    return;
  }
  if (visGraph.value) {
    visGraph.value.destroy();
  }
  const h = timeline.value.getBoundingClientRect().height;
  const events = eventStore.events.map((d, index) => {
    return {
      id: index + 1,
      content: d.name,
      start: dateFormat(d.startTime),
      end: dateFormat(d.endTime),
      data: d,
    };
  });
  const items: any = new DataSet(events);
  const options = {
    height: h,
    width: "100%",
    locale: "en",
    tooltip: {
      template(item) {
        const data = item.data || {};
        return `<div>ID: ${data.uuid || ""}</div>
        <div>Name: ${data.name || ""}</div>
        <div>Event Type: ${data.type || ""}</div>
        <div>Start Time: ${data.startTime ? visDate(data.startTime) : ""}</div>
        <div>End Time: ${data.endTime ? visDate(data.endTime) : ""}</div>
        <div>Message: ${data.message || ""}</div>
        <div>Service: ${data.source.service || ""}</div>
        <div>Endpoint: ${data.source.endpoint || ""}</div>
        <div>Service Instance: ${data.source.instance || ""}</div>`;
      },
    },
  };
  visGraph.value = new Timeline(timeline.value, items, options);
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
