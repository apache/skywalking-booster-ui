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
  <div class="trace-detail" v-loading="loading">
    <div class="trace-detail-wrapper clear" v-if="traceStore.currentTrace?.endpointNames">
      <div class="flex-h" style="justify-content: space-between">
        <h5 class="mb-5 mt-0">
          <span class="vm">{{ traceStore.currentTrace?.endpointNames?.[0] }}</span>
        </h5>
        <div>
          <el-button size="small" class="mr-10" @click="searchTraceLogs">
            {{ t("viewLogs") }}
          </el-button>
        </div>
      </div>
      <div class="mb-5 blue">
        <Selector
          size="small"
          :value="
            traceStore.currentTrace.traceIds &&
            traceStore.currentTrace.traceIds[0] &&
            traceStore.currentTrace.traceIds[0].value
          "
          :options="traceStore.currentTrace.traceIds"
          @change="changeTraceId"
          class="trace-detail-ids"
        />
        <Icon class="cp ml-5" iconName="copy" @click="handleClick" />
      </div>
      <div class="flex-h item">
        <div>
          <div class="tag mr-5">{{ t("start") }}</div>
          <span class="mr-15 sm">
            {{ dateFormat(parseInt(traceStore.currentTrace.start)) }}
          </span>
          <div class="tag mr-5">{{ t("duration") }}</div>
          <span class="mr-15 sm">{{ traceStore.currentTrace.duration }} ms</span>
          <div class="tag mr-5">{{ t("spans") }}</div>
          <span class="sm">{{ traceStore.traceSpans.length }}</span>
        </div>
        <div class="flex-h trace-type item">
          <el-radio-group v-model="spansGraphType" size="small">
            <el-radio-button v-for="option in GraphTypeOptions" :key="option.value" :value="option.value">
              <Icon :iconName="option.icon" />
              {{ t(option.label) }}
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
    <div class="no-data" v-else>{{ t("noData") }}</div>
    <div class="trace-chart">
      <component
        v-if="traceStore.currentTrace?.endpointNames"
        :is="spansGraphType"
        :data="traceStore.traceSpans"
        :traceId="traceStore.currentTrace?.traceIds?.[0]?.value"
        :showBtnDetail="false"
        :headerType="WidgetType.Trace"
      />
    </div>
  </div>
</template>
<script lang="ts">
  import { ref, defineComponent, inject } from "vue";
  import { useI18n } from "vue-i18n";
  import { useTraceStore } from "@/store/modules/trace";
  import type { Option } from "@/types/app";
  import copy from "@/utils/copy";
  import graphs from "../VisGraph/index";
  import { ElMessage } from "element-plus";
  import getDashboard from "@/hooks/useDashboardsSession";
  import type { LayoutConfig } from "@/types/dashboard";
  import { dateFormat } from "@/utils/dateFormat";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { WidgetType } from "@/views/dashboard/data";

  const GraphTypeOptions = [
    { value: "List", icon: "list-bulleted", label: "list" },
    { value: "Tree", icon: "issue-child", label: "tree" },
    { value: "Table", icon: "table", label: "table" },
    { value: "Statistics", icon: "statistics-bulleted", label: "statistics" },
  ] as const;
  const props = {
    serviceId: { type: String, default: "" },
  };

  export default defineComponent({
    name: "TraceDetail",
    components: {
      ...graphs,
    },
    props,
    setup(props) {
      const appStore = useAppStoreWithOut();
      const options: LayoutConfig | null = inject("options") || null;
      const { t } = useI18n();
      const traceStore = useTraceStore();
      const loading = ref<boolean>(false);
      const traceId = ref<string>("");
      const spansGraphType = ref<string>("List");

      function handleClick() {
        copy(traceId.value || traceStore.currentTrace?.traceIds?.[0]?.value);
      }

      async function changeTraceId(opt: Option[]) {
        traceId.value = opt[0].value;
        loading.value = true;
        const res = await traceStore.getTraceSpans({ traceId: opt[0].value });
        if (res.errors) {
          ElMessage.error(res.errors);
        }
        loading.value = false;
      }

      async function searchTraceLogs() {
        const { associationWidget } = getDashboard();
        associationWidget(
          options?.id || "",
          {
            sourceId: options?.id || "",
            traceId: traceId.value || traceStore.currentTrace?.traceIds?.[0]?.value,
            id: props.serviceId || undefined,
          },
          WidgetType.Log,
        );
      }
      return {
        traceStore,
        dateFormat,
        changeTraceId,
        handleClick,
        t,
        searchTraceLogs,
        appStore,
        loading,
        traceId,
        WidgetType,
        spansGraphType,
        GraphTypeOptions,
      };
    },
  });
</script>
<style lang="scss" scoped>
  .trace-detail {
    flex: 1;
    height: 100%;
    overflow: hidden;
  }

  .trace-chart {
    height: calc(100% - 95px);
    overflow: auto;
  }

  .trace-detail-wrapper {
    font-size: $font-size-smaller;
    padding: 5px 10px;
    border-bottom: 1px solid $border-color-primary;
    width: 100%;
    height: 95px;

    .grey {
      color: #fff;
      background-color: $active-background;
    }

    .ghost {
      cursor: pointer;
      background: rgb(0 0 0 / 30%);
    }
  }

  .item {
    justify-content: space-between;
    align-items: center;
  }

  .trace-detail-ids {
    background-color: rgb(0 0 0 / 0%);
    outline: 0;
    border-style: unset;
    color: inherit;
    border: 1px solid;
    border-radius: 4px;
    width: 300px;
  }

  .tag {
    display: inline-block;
    border-radius: 4px;
    padding: 0 7px;
    background-color: #40454e;
    color: #eee;
  }

  .no-data {
    padding-top: 50px;
    width: 100%;
    text-align: center;
  }

  .trace-type {
    // padding: 10px 0 10px 10px;
    border-bottom: 1px solid $border-color-primary;

    /* Make radio buttons content align nicely with icons */
    :deep(.el-radio-button__inner) {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
  }
</style>
