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
      <Filter :needQuery="needQuery" :data="data" @get="getService" />
    </div>
    <div class="trace flex-h">
      <TraceList />
      <TraceDetail :serviceId="serviceId" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { provide, ref } from "vue";
  import type { PropType } from "vue";
  import Filter from "../related/trace/Filter.vue";
  import TraceList from "../related/trace/TraceList.vue";
  import TraceDetail from "../related/trace/Detail.vue";
  import { useI18n } from "vue-i18n";
  import { useDashboardStore } from "@/store/modules/dashboard";

  /* global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<any>,
      default: () => ({ graph: {} }),
    },
    activeIndex: { type: String, default: "" },
    needQuery: { type: Boolean, default: true },
  });
  provide("options", props.data);
  const serviceId = ref<string>("");
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  function removeWidget() {
    dashboardStore.removeControls(props.data);
  }
  function getService(id: string) {
    serviceId.value = id;
  }
</script>
<style lang="scss" scoped>
  .trace-wrapper {
    width: 100%;
    height: 100%;
    font-size: $font-size-smaller;
    position: relative;
    overflow: auto;
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

    &:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }
  }

  .trace {
    min-height: calc(100% - 150px);
    width: 100%;
    overflow: auto;
    min-width: 1000px;
  }
</style>
