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
  <div class="trace-wrapper flex-v">
    <div class="search-bar">
      <SearchBar :data="data" />
    </div>
    <div class="trace flex-h">
      <SegmentList />
      <SpanList />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { provide } from "vue";
  import type { PropType } from "vue";
  import type { LayoutConfig } from "@/types/dashboard";
  import SearchBar from "./components/TraceList/SearchBar.vue";
  import SegmentList from "./components/TraceList/SegmentList.vue";
  import SpanList from "./components/TraceList/SpanList.vue";
  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({}),
    },
  });
  provide("options", props.data);
</script>
<style lang="scss" scoped>
  .trace-wrapper {
    width: 100%;
    height: 100%;
    font-size: $font-size-smaller;
    position: relative;
    overflow: auto;
  }
</style>
