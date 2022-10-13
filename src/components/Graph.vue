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
  <div class="chart" ref="chartRef" :style="`height:${height};width:${width};`">
    <div v-if="!available" class="no-data">No Data</div>
    <div class="menus" v-show="visMenus" ref="menus">
      <div class="tools" @click="associateMetrics">
        {{ t("associateMetrics") }}
      </div>
      <div class="tools" @click="viewTrace">
        {{ t("viewTrace") }}
      </div>
    </div>
    <el-drawer
      v-model="showTrace"
      :title="t('trace')"
      size="100%"
      :destroy-on-close="true"
      :before-close="() => (showTrace = false)"
      :append-to-body="true"
    >
      <Trace :data="traceOptions" />
    </el-drawer>
  </div>
</template>
<script lang="ts" setup>
import {
  watch,
  ref,
  Ref,
  onMounted,
  onBeforeUnmount,
  unref,
  computed,
} from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { EventParams } from "@/types/app";
import { useECharts } from "@/hooks/useEcharts";
import { useAppStoreWithOut } from "@/store/modules/app";
import { addResizeListener, removeResizeListener } from "@/utils/event";
import Trace from "@/views/dashboard/controls/Trace.vue";
import dateFormatStep from "@/utils/dateFormat";
import getLocalTime from "@/utils/localtime";
import associateProcessor from "@/hooks/useAssociateProcessor";

/*global Nullable, defineProps, defineEmits*/
const emits = defineEmits(["select"]);
const { t } = useI18n();
const appStore = useAppStoreWithOut();
const chartRef = ref<Nullable<HTMLDivElement>>(null);
const menus = ref<Nullable<HTMLDivElement>>(null);
const visMenus = ref<boolean>(false);
const { setOptions, resize, getInstance } = useECharts(
  chartRef as Ref<HTMLDivElement>
);
const currentParams = ref<Nullable<EventParams>>(null);
const showTrace = ref<boolean>(false);
const traceOptions = ref<{ type: string; filters?: unknown }>({
  type: "Trace",
});
const props = defineProps({
  height: { type: String, default: "100%" },
  width: { type: String, default: "100%" },
  option: {
    type: Object as PropType<{ [key: string]: any }>,
    default: () => ({}),
  },
  filters: {
    type: Object as PropType<{
      duration: {
        startTime: string;
        endTime: string;
      };
      isRange: boolean;
      dataIndex?: number;
      sourceId: string;
    }>,
  },
});
const available = computed(
  () =>
    (Array.isArray(props.option.series) &&
      props.option.series[0] &&
      props.option.series[0].data) ||
    (Array.isArray(props.option.series.data) && props.option.series.data[0])
);
onMounted(async () => {
  await setOptions(props.option);
  chartRef.value && addResizeListener(unref(chartRef), resize);
  instanceEvent();
});

function instanceEvent() {
  setTimeout(() => {
    const instance = getInstance();

    if (!instance) {
      return;
    }
    instance.on("click", (params: EventParams) => {
      currentParams.value = params;
      if (!menus.value) {
        return;
      }
      visMenus.value = true;
      menus.value.style.left = params.event.offsetX + "px";
      menus.value.style.top = params.event.offsetY + "px";
    });
    document.addEventListener(
      "click",
      () => {
        if (instance.isDisposed()) {
          return;
        }
        visMenus.value = false;
        instance.dispatchAction({
          type: "hideTip",
        });
        instance.dispatchAction({
          type: "updateAxisPointer",
          currTrigger: "leave",
        });
      },
      true
    );
  }, 1000);
}

function associateMetrics() {
  emits("select", currentParams.value);
  visMenus.value = true;
}

function updateOptions() {
  const instance = getInstance();
  if (!instance) {
    return;
  }
  if (!props.filters) {
    return;
  }
  if (props.filters.isRange) {
    const { eventAssociate } = associateProcessor();
    const options = eventAssociate(props);
    setOptions(options || props.option);
  } else {
    instance.dispatchAction({
      type: "showTip",
      dataIndex: props.filters.dataIndex,
      seriesIndex: 0,
    });
  }
}

function viewTrace() {
  const item = associateProcessor().traceFilters(currentParams.value);
  console.log(item);
  traceOptions.value = {
    ...traceOptions.value,
    filters: item,
  };
  showTrace.value = true;
}

watch(
  () => props.option,
  (newVal, oldVal) => {
    if (!available.value) {
      return;
    }
    if (JSON.stringify(newVal) === JSON.stringify(oldVal)) {
      return;
    }
    let options;
    if (props.filters && props.filters.isRange) {
      const { eventAssociate } = associateProcessor();
      options = eventAssociate(props);
    }
    setOptions(options || props.option);
  }
);
watch(
  () => props.filters,
  () => {
    updateOptions();
  }
);

onBeforeUnmount(() => {
  removeResizeListener(unref(chartRef), resize);
});
</script>
<style lang="scss" scoped>
.no-data {
  font-size: 12px;
  height: 100%;
  box-sizing: border-box;
  display: -webkit-box;
  -webkit-box-orient: horizontal;
  -webkit-box-pack: center;
  -webkit-box-align: center;
  color: #666;
}

.chart {
  overflow: hidden;
}

.menus {
  position: absolute;
  display: block;
  white-space: nowrap;
  z-index: 9999999;
  box-shadow: #ddd 1px 2px 10px;
  transition: all cubic-bezier(0.075, 0.82, 0.165, 1) linear;
  background-color: rgb(255, 255, 255);
  border-radius: 4px;
  color: rgb(51, 51, 51);
  padding: 5px;
}

.tools {
  padding: 5px;
  color: #999;
  cursor: pointer;
  text-align: center;

  &:hover {
    color: #409eff;
    background-color: #eee;
  }
}
</style>
