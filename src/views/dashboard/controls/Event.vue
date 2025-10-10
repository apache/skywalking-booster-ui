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
  <div class="event-wrapper flex-v">
    <div class="operations">
      <span class="cp" @click="handleCollapse">
        <Icon iconName="sort" size="middle" />
      </span>
      <el-popover placement="bottom" trigger="click" :width="100" v-if="dashboardStore.editMode">
        <template #reference>
          <span class="cp">
            <Icon iconName="ellipsis_v" size="middle" />
          </span>
        </template>
        <div class="tools" @click="editConfig">
          <span>{{ t("edit") }}</span>
        </div>
        <div class="tools" @click="removeWidget">
          <span>{{ t("delete") }}</span>
        </div>
      </el-popover>
    </div>
    <div class="header">
      <Header :needQuery="needQuery" />
    </div>
    <Transition name="collapse">
      <div class="event" v-if="!collapsedState">
        <Content :data="data" />
      </div>
    </Transition>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import Header from "../related/event/Header.vue";
  import Content from "../related/event/Content.vue";
  import type { LayoutConfig } from "@/types/dashboard";

  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({}),
    },
    activeIndex: { type: String, default: "" },
    needQuery: { type: Boolean, default: true },
  });
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const collapsedState = ref(false);
  const originalState = ref({ h: props.data.h });

  function removeWidget() {
    dashboardStore.removeControls(props.data);
  }
  function editConfig() {
    dashboardStore.setConfigPanel(true);
    dashboardStore.selectWidget(props.data);
  }
  function handleCollapse() {
    dashboardStore.activeGridItem(props.data.i);
    collapsedState.value = !collapsedState.value;
    if (collapsedState.value) {
      dashboardStore.setConfigs({ ...props.data, ...{ h: 3 } });
    } else {
      dashboardStore.setConfigs({ ...props.data, ...originalState.value });
    }
  }
</script>
<style lang="scss" scoped>
  .event-wrapper {
    width: 100%;
    height: 100%;
    font-size: $font-size-smaller;
    position: relative;
    overflow: auto;
  }

  .operations {
    position: absolute;
    top: 5px;
    right: 3px;
    z-index: 9999;
  }

  .header {
    padding: 10px;
    font-size: $font-size-smaller;
    border-bottom: 1px solid $border-color;
    min-width: 1024px;
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

  .event {
    width: 100%;
    height: calc(100% - 80px);
  }

  .collapse-enter-active,
  .collapse-leave-active {
    transition: all 0.8s ease;
    overflow: hidden;
  }

  .collapse-enter-from,
  .collapse-leave-to {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }

  .collapse-enter-to,
  .collapse-leave-from {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
</style>
