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
    <div
      :class="['profile-item', 'level' + data.parentId]"
      :style="{ color: data.topDur ? '#448dfe' : appStore.theme === Themes.Dark ? '#fafbfc' : '#3d444f' }"
    >
      <div
        :class="['thread', 'level' + data.parentId]"
        :style="{
          'text-indent': data.parentId * 4 + 'px',
          width: `${thread}px`,
        }"
      >
        <Icon
          class="icon vm cp trans"
          :style="!displayChildren ? 'transform: rotate(-90deg);' : ''"
          @click.stop="toggle"
          v-if="data.children && data.children.length"
          iconName="arrow-down"
        />
        <el-tooltip :content="data.codeSignature" placement="bottom">
          <span>
            {{ data.codeSignature }}
          </span>
        </el-tooltip>
      </div>
      <div class="self">{{ data.duration }}</div>
      <div class="exec-ms">{{ data.durationChildExcluded }}</div>
      <div class="dump-count">{{ data.count }}</div>
    </div>
    <div v-show="data.children && data.children.length && displayChildren" class="children-trace">
      <table-item :thread="thread" v-for="(item, index) in data.children" :key="index" :data="item" />
    </div>
  </div>
</template>
<script lang="ts">
  import { ref, defineComponent, toRefs } from "vue";
  import type { PropType } from "vue";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { Themes } from "@/constants/data";

  const props = {
    data: { type: Object as PropType<any>, default: () => ({}) },
    thread: { type: Number, default: 0 },
  };
  export default defineComponent({
    name: "TableItem",
    props,
    setup(props) {
      const appStore = useAppStoreWithOut();
      const displayChildren = ref<boolean>(true);
      function toggle() {
        displayChildren.value = !displayChildren.value;
      }
      return { Themes, appStore, toggle, displayChildren, ...toRefs(props) };
    },
  });
</script>
<style lang="scss" scoped>
  @import url("./profile.scss");

  .profile-item.level0 {
    background-color: var(--sw-list-hover);
    color: var(--el-color-primary);

    &:hover {
      background-color: var(--sw-list-hover);
      color: var(--el-color-primary);
    }

    &::before {
      position: absolute;
      content: "";
      width: 5px;
      height: 100%;
      background-color: var(--el-color-primary);
      left: 0;
    }
  }

  .profile-item {
    position: relative;
    white-space: nowrap;
  }

  .profile-item.selected {
    background-color: var(--sw-list-selected);
  }

  .profile-item:not(.level0):hover {
    background-color: var(--sw-list-hover);
  }

  .profile-item > div {
    display: inline-block;
    padding: 0 5px;
    border: 1px solid transparent;
    border-right: 1px dotted silver;
    overflow: hidden;
    line-height: 30px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .profile-item > div.method {
    padding-left: 10px;
  }

  .profile-item div.exec-percent {
    width: 10%;
    height: 30px;
    padding: 0 8px;

    .outer-progress_bar {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: var(--el-color-primary);
      position: relative;
      margin-top: 11px;
      border: none;
    }

    .inner-progress_bar {
      position: absolute;
      background: rgb(110 64 170);
      height: 4px;
      border-radius: 2px;
      left: 0;
      border: none;
      top: 1px;
    }
  }
</style>
