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
  <div class="chart-table">
    <div ref="chartTable">
      <div
        class="row header flex-h"
        :style="`width: ${nameWidth + initWidth}px`"
      >
        <div class="name" :style="`width: ${nameWidth}px`">
          {{ config.tableHeaderCol1 || $t("name") }}
          <i class="r cp" ref="draggerName"
            ><rk-icon icon="settings_ethernet"
          /></i>
        </div>
        <div class="value-col" v-if="config.showTableValues">
          {{ config.tableHeaderCol2 || $t("value") }}
        </div>
      </div>
      <div
        class="row flex-h"
        v-for="key in dataKeys"
        :key="key"
        :style="`width: ${nameWidth + initWidth}px`"
      >
        <div :style="`width: ${nameWidth}px`">{{ key }}</div>
        <div class="value-col" v-if="config.showTableValues">
          {{ data[key][data[key].length - 1 || 0] }}
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import type { PropType } from "vue";
/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<{ [key: string]: number[][] }>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<{
      showTableValues: boolean;
      tableHeaderCol2: string;
      tableHeaderCol1: string;
    }>,
    default: () => ({}),
  },
});
/*global Nullable*/
const chartTable = ref<Nullable<HTMLElement>>(null);
const initWidth = ref<number>(0);
const nameWidth = ref<number>(0);
const draggerName = ref<Nullable<HTMLElement>>(null);
onMounted(() => {
  if (!chartTable.value) {
    return;
  }
  const width = props.config.showTableValues
    ? chartTable.value.offsetWidth / 2
    : chartTable.value.offsetWidth;
  initWidth.value = props.config.showTableValues
    ? chartTable.value.offsetWidth / 2
    : 0;
  nameWidth.value = width - 5;
  if (!draggerName.value) {
    return;
  }
  draggerName.value.onmousedown = (event: MouseEvent) => {
    const diffX = event.clientX;
    const copy = nameWidth;
    document.onmousemove = (documentEvent) => {
      const moveX = documentEvent.clientX - diffX;
      nameWidth.value = Number(copy) + Number(moveX);
    };
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
});
const dataKeys = computed(() => {
  const keys = Object.keys(props.data || {}).filter(
    (i: any) => Array.isArray(props.data[i]) && props.data[i].length
  );
  return keys;
});
</script>
<style lang="scss" scoped>
.chart-table {
  height: 100%;
  width: 100%;
  overflow: auto;

  .name {
    padding-left: 15px;
  }

  .row {
    border-left: 1px solid #ccc;
    height: 20px;

    div {
      overflow: hidden;
      text-overflow: ellipsis;
      border-right: 1px solid #ccc;
      text-align: center;
      height: 20px;
      line-height: 20px;
      display: inline-block;
    }

    div:last-child {
      border-bottom: 1px solid #ccc;
    }

    div:nth-last-child(2) {
      border-bottom: 1px solid #ccc;
    }
  }

  .dark {
    color: #eee;
  }

  .row:first-child {
    div {
      border-top: 1px solid #ccc;
      background: #eee;
    }
  }

  .header {
    color: #000;
    font-weight: bold;
  }

  .value-col {
    width: 50%;
  }
}
</style>
