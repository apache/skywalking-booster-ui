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
  <div class="slow-statements-wrapper flex-v">
    <el-popover placement="bottom" trigger="click" :width="100" v-if="dashboardStore.editMode">
      <template #reference>
        <span class="delete cp">
          <Icon iconName="ellipsis_v" size="middle" class="operation" />
        </span>
      </template>
      <div class="tools" @click="removeWidget">
        <span>{{ t("delete") }}</span>
      </div>
    </el-popover>

    <div class="header">
      <div class="search">
        <Selector style="width: 150px" v-model="topN" :options="topNList" />
        <el-button class="search-btn" @click="searchSlowStatements">
          <Icon size="middle" iconName="search" />
        </el-button>
      </div>
    </div>
    <widget :data="widgetConfig" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, watch, onMounted, computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { LayoutConfig } from "@/types/dashboard";
  import Widget from "@/views/dashboard/controls/Widget.vue";
  import { useAppStoreWithOut } from "@/store/modules/app";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const appStore = useAppStoreWithOut();
  const topN = ref<number>(20);
  const topNList = [
    { label: "TopN20", value: 20 },
    { label: "TopN50", value: 50 },
    { label: "TopN100", value: 100 },
    { label: "TopN150", value: 150 },
    { label: "TopN200", value: 200 },
  ];

  const props = defineProps({
    data: {
      type: Object as PropType<LayoutConfig>,
      default: () => ({}),
    },
  });

  const defaultWidgetConfig = ref<any>({
    widget: { title: "Slow Statements (ms)" },
    graph: { color: "purple", type: "TopList" },
    expressions: ["top_n(top_n_service_database_statement,20,des)"],
    relatedTrace: { refIdType: "traceId" },
  });

  const widgetConfig = computed(() => {
    return {
      ...defaultWidgetConfig.value,
      ...props.data,
      i: dashboardStore.selectedGrid?.i,
    };
  });

  function removeWidget() {
    dashboardStore.removeControls(props.data);
  }

  function searchSlowStatements() {
    defaultWidgetConfig.value = {
      ...defaultWidgetConfig.value,
      expressions: [`top_n(top_n_service_database_statement,${topN.value},des)`],
    };
  }

  watch(
    () => appStore.durationTime,
    () => {
      searchSlowStatements();
    },
  );

  onMounted(() => {
    searchSlowStatements();
  });
</script>
<style lang="scss" scoped>
  .slow-statements-wrapper {
    width: 100%;
    height: 100%;
    font-size: $font-size-smaller;
    position: relative;
  }

  .delete {
    position: absolute;
    top: 5px;
    right: 3px;
  }

  .header {
    padding: 10px;
    font-size: $font-size-smaller;
    border-bottom: 1px solid $border-color;
    min-width: 1000px;
  }

  .tools {
    padding: 5px 0;
    color: #999;
    cursor: pointer;
    position: relative;
    text-align: center;
  }
</style>
