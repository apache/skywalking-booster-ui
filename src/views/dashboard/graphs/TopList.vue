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
  <div class="top-list" v-if="available">
    <div class="chart-slow-i" v-for="(i, index) in data[key]" :key="index">
      <div class="ell tools flex-h">
        <div class="desc">
          <span class="calls mr-10">{{ i.value }}</span>
          <span class="cp mr-20">
            {{ i.name }}
          </span>
        </div>
        <el-popover placement="bottom" trigger="click">
          <template #reference>
            <div class="operation-icon cp ml-10">
              <Icon iconName="ellipsis_v" size="middle" />
            </div>
          </template>
          <div class="operation" @click="handleClick(i.name)">
            <span>{{ t("copy") }}</span>
          </div>
          <div class="operation" @click="viewTrace(i)" v-show="refIdType === RefIdTypes[0].value">
            <span>{{ t("viewTrace") }}</span>
          </div>
        </el-popover>
      </div>
      <el-progress
        :stroke-width="6"
        :percentage="isNaN(Number(i.value) / maxValue) ? 0 : (Number(i.value) / maxValue) * 100"
        :color="TextColors[config.color || 'purple']"
        :show-text="false"
      />
    </div>
    <el-drawer
      v-model="showTrace"
      size="100%"
      :destroy-on-close="true"
      :before-close="() => (showTrace = false)"
      :append-to-body="true"
      title="The Related Traces"
    >
      <Trace :data="traceOptions" />
    </el-drawer>
  </div>
  <div class="center no-data" v-else>No Data</div>
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { computed, ref } from "vue";
  import copy from "@/utils/copy";
  import { TextColors } from "@/views/dashboard/data";
  import Trace from "@/views/dashboard/related/trace/Index.vue";
  import { QueryOrders, Status, RefIdTypes, ProtocolTypes, ExpressionResultType } from "../data";
  import { WidgetType } from "@/views/dashboard/data";

  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<{
        [key: string]: { name: string; value: number; refId: string }[];
      }>,
      default: () => ({}),
    },
    config: {
      type: Object as PropType<{
        metricMode: string;
        color: string;
        metrics: string[];
        metricTypes: string[];
        typesOfMQE: string[];
        relatedTrace: any;
      }>,
      default: () => ({ color: "purple" }),
    },
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  });
  const { t } = useI18n();
  const showTrace = ref<boolean>(false);
  const traceOptions = ref<{ type: string; filters?: unknown }>({
    type: WidgetType.Trace,
  });
  const refIdType = computed(
    () => (props.config.relatedTrace && props.config.relatedTrace.refIdType) || RefIdTypes[0].value,
  );
  const key = computed(() => Object.keys(props.data)[0] || "");
  const available = computed(
    () => Array.isArray(props.data[key.value]) && props.data[key.value][0] && props.data[key.value][0].value,
  );
  const maxValue = computed(() => {
    if (!(props.data[key.value] && props.data[key.value].length)) {
      return 0;
    }
    const temp: number[] = props.data[key.value].map((i: any) => i.value);
    return Math.max.apply(null, temp);
  });
  function handleClick(i: string) {
    copy(i);
  }
  function viewTrace(item: { name: string; refId: string; value: unknown }) {
    const filters = {
      ...item,
      queryOrder: QueryOrders[1].value,
      status: Status[2].value,
      id: item.refId,
      metricValue: [{ label: props.config.metrics[0], data: item.value, value: item.name }],
      isReadRecords:
        props.config.typesOfMQE.includes(ExpressionResultType.RECORD_LIST) ||
        props.config.metricTypes.includes(ProtocolTypes.ReadRecords) ||
        undefined,
    };
    traceOptions.value = {
      ...traceOptions.value,
      filters,
    };
    showTrace.value = true;
  }
</script>
<style lang="scss" scoped>
  .top-list {
    height: 100%;
    overflow: auto;
    padding: 10px;
  }

  .tools {
    justify-content: space-between;
  }

  .progress-bar {
    font-size: $font-size-smaller;
    color: $font-color;
  }

  .chart-slow-i {
    padding: 6px 0;
  }

  .chart-slow {
    height: 100%;
  }

  .desc {
    flex-grow: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .calls {
    font-size: $font-size-smaller;
    padding: 0 5px;
    display: inline-block;
    background-color: #40454e;
    color: #eee;
    border-radius: 4px;
  }

  .chart-slow-link {
    padding: 4px 10px 7px;
    border-radius: 4px;
    border: 1px solid #ddd;
    color: $font-color;
    background-color: $theme-background;
    will-change: opacity, background-color;
    transition: opacity 0.3s, background-color 0.3s;
  }

  .no-data {
    height: 100%;
    color: #666;
    box-sizing: border-box;
    display: -webkit-box;
    -webkit-box-orient: horizontal;
    -webkit-box-pack: center;
    -webkit-box-align: center;
  }

  .operation-icon {
    color: $font-color;
  }

  .operation {
    padding: 5px 0;
    color: $font-color;
    cursor: pointer;
    position: relative;
    text-align: center;
    font-size: $font-size-smaller;

    &:hover {
      color: $active-color;
      background-color: $popper-hover-bg-color;
    }
  }
</style>
