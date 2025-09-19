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
  <g>
    <line
      v-for="marker in markers"
      :key="marker.duration"
      :x1="`${marker.position}%`"
      :y1="0"
      :x2="`${marker.position}%`"
      y2="100%"
      stroke="var(--el-border-color-light)"
    />
    <text
      v-for="(marker, index) in markers"
      :key="`label-${marker.duration}`"
      :x="`${marker.position}%`"
      :y="12"
      font-size="10"
      fill="var(--sw-font-grey-color)"
      text-anchor="right"
      :transform="`translate(${index === markers.length - 1 ? -50 : 5}, 0)`"
    >
      {{ marker.duration }}ms
    </text>
    <line x1="0" y1="100%" x2="100%" y2="100%" stroke="var(--el-border-color-light)" />
  </g>
</template>
<script lang="ts" setup>
  import { computed } from "vue";

  interface Props {
    minTimestamp: number;
    maxTimestamp: number;
  }

  const props = defineProps<Props>();
  // Calculate markers duration for timeline
  const markers = computed(() => {
    const maxDuration = props.maxTimestamp - props.minTimestamp;
    // Create markers with duration values and their corresponding percentage positions
    const markerDurations = [0, (maxDuration * 1) / 3, (maxDuration * 2) / 3, maxDuration];

    return markerDurations.map((duration) => ({
      duration: duration.toFixed(3),
      position: maxDuration > 0 ? (duration / maxDuration) * 100 : 0,
    }));
  });
</script>
<style scoped></style>
