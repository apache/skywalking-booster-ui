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
  <div class="text">
    <div class="header">
      <el-popover placement="bottom" trigger="click" :width="100" v-if="dashboardStore.editMode">
        <template #reference>
          <span>
            <Icon iconName="ellipsis_v" size="middle" class="operation" />
          </span>
        </template>
        <div class="tools" @click="editConfig">
          <span>{{ t("edit") }}</span>
        </div>
        <div class="tools" @click="removeTopo">
          <span>{{ t("delete") }}</span>
        </div>
      </el-popover>
    </div>
    <div
      class="body"
      :style="{
        backgroundColor,
        justifyContent: graph.textAlign,
      }"
    >
      <a
        :href="graph.url"
        target="_blank"
        :style="{
          color: fontColor,
          fontSize: graph.fontSize + 'px',
          textDecoration: 'underline',
        }"
      >
        {{ graph.content }}
      </a>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { TextColors } from "@/views/dashboard/data";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { Themes } from "@/constants/data";

  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
    activeIndex: { type: String, default: "" },
  });
  const { t } = useI18n();
  const appStore = useAppStoreWithOut();
  const graph = computed(() => props.data.graph || {});
  const dashboardStore = useDashboardStore();

  const backgroundColor = computed(
    () => TextColors[graph.value.backgroundColor] || (appStore.theme === Themes.Dark ? "#212224" : "#fff"),
  );
  const fontColor = computed(
    () => TextColors[graph.value.fontColor] || (appStore.theme === Themes.Dark ? "#fafbfc" : "#3d444f"),
  );

  function removeTopo() {
    dashboardStore.removeControls(props.data);
  }
  function editConfig() {
    dashboardStore.setConfigPanel(true);
    dashboardStore.selectWidget(props.data);
  }
</script>
<style lang="scss" scoped>
  .text {
    font-size: $font-size-smaller;
    height: 100%;
    position: relative;
  }

  .operation {
    cursor: pointer;
  }

  .header {
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .body {
    padding: 0 20px 0 10px;
    width: 100%;
    height: 100%;
    cursor: pointer;
    display: flex;
    align-items: center;
    overflow: auto;
  }

  .tools {
    padding: 5px 0;
    color: #999;
    cursor: pointer;
    position: relative;
    text-align: center;

    &:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }
  }
</style>
