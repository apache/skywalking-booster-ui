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
  <div class="profile">
    <div class="profile-header">
      <div class="thread" :style="`width: ${thread}px`">
        Thread Stack
        <span class="r cp dragger" ref="dragger">
          <Icon iconName="settings_ethernet" />
        </span>
      </div>
      <div class="self">Duration (ms)</div>
      <div class="exec-ms">
        Self Duration (ms)
        <a
          class="profile-set-btn"
          @click="updateHighlightTop"
          title="Highlight top 10 slow methods"
          :style="{ color: highlightTop ? '#448dfe' : '#484b55' }"
        >
          top slow
        </a>
      </div>
      <div class="dump-count">Dump Count</div>
    </div>
    <TableItem :thread="thread" v-for="(item, index) in tableData" :data="item" :key="'key' + index" />
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
  import { useProfileStore } from "@/store/modules/profile";
  import { ref, onMounted } from "vue";
  import type { PropType } from "vue";
  import TableItem from "./Item.vue";

  /* global defineProps */
  defineProps({
    tableData: { type: Array as PropType<any>, default: () => [] },
    highlightTop: { type: Boolean, default: false },
  });
  const dragger = ref<any>(null);
  const thread = ref<number>(500);
  const profileStore = useProfileStore();

  onMounted(() => {
    dragger.value.onmousedown = (event: any) => {
      const diffX = event.clientX;
      const copy = thread.value;
      document.onmousemove = (documentEvent) => {
        const moveX = documentEvent.clientX - diffX;
        thread.value = copy + moveX;
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  });

  function updateHighlightTop() {
    profileStore.setHighlightTop();
  }
</script>
<style lang="scss" scoped>
  @import url("./profile.scss");

  .dragger {
    float: right;
  }

  .profile {
    font-size: $font-size-smaller;
    height: 100%;

    .profile-set-btn {
      font-size: $font-size-smaller;
      border: 1px solid $disabled-color;
      border-radius: 3px;
      text-align: center;
      width: 57px;
      overflow: hidden;
      display: inline-block;
      height: 20px;
      line-height: 20px;
      position: absolute;
      top: 4px;
      right: 3px;
      padding: 0 3px;
    }
  }

  .profile-header {
    white-space: nowrap;
    user-select: none;
    border-left: 0;
    border-right: 0;
    border-bottom: 1px solid var(--sw-trace-list-border);
  }

  .profile-header div {
    display: inline-block;
    padding: 0 4px;
    border-right: 1px dotted silver;
    line-height: 30px;
    background-color: var(--sw-table-header);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
