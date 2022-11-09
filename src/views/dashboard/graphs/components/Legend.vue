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
  <div
    class="legend"
    :style="`width: ${
      config.width || (isRight ? '150px' : '100%')
    }; maxHeight:${isRight ? '100%' : 130}`"
    v-if="tableData.length && config.asTable"
  >
    <table>
      <tr class="col-item">
        <td class="header-cell"></td>
        <td v-for="h in headerRow" :key="h.value">
          <div class="cell">{{ h.label }}</div>
        </td>
      </tr>
      <tr class="col-item" v-for="(item, index) in tableData" :key="index">
        <td class="header-cell">
          <el-popover placement="bottom" :width="100" trigger="click">
            <template #reference>
              <div class="cell name">
                <Icon iconName="circle" :style="`color: ${colors[index]};`" />
                <i>{{ item.name }}</i>
              </div>
            </template>
            <div>
              <div
                class="value"
                v-for="(value, index) in item.topN"
                :key="index"
              >
                <span>{{ index }}</span>
                <span>{{ value }}</span>
              </div>
            </div>
          </el-popover>
        </td>
        <td v-for="h in headerRow" :key="h.value">
          <div class="cell">{{ item[h.value] }}</div>
        </td>
      </tr>
    </table>
  </div>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";
import { LegendOptions } from "@/types/dashboard";
import useLegendProcess from "@/hooks/useLegendProcessor";

/*global defineProps */
const props = defineProps({
  data: {
    type: Object as PropType<{ [key: string]: number[] }>,
    default: () => ({}),
  },
  config: {
    type: Object as PropType<LegendOptions>,
    default: () => ({}),
  },
});

const tableData = computed(() => {
  const { aggregations } = useLegendProcess(props.config);
  return aggregations(props.data).source;
});
const headerRow = computed(() => {
  const { aggregations } = useLegendProcess(props.config);
  return aggregations(props.data).headers;
});
const isRight = computed(() => useLegendProcess(props.config).isRight);
const colors = computed(() => {
  const keys = Object.keys(props.data || {}).filter(
    (i: any) => Array.isArray(props.data[i]) && props.data[i].length
  );
  const { chartColors } = useLegendProcess(props.config);
  return chartColors(keys);
});
</script>
<style lang="scss" scoped>
table {
  table-layout: fixed;
  width: 100%;
}

.legend {
  overflow: auto;
}

.col-item {
  td {
    font-size: 12px;
    font-weight: normal;
    padding: 3px 0;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    width: 100px;

    &.header-cell {
      width: 150px;
    }
  }
}

.cell {
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-all;
  line-height: 23px;
  padding: 0 5px;

  i {
    font-style: normal;
  }
}

.value {
  span {
    display: inline-block;
    padding: 5px;
    width: 50px;
  }
}

.name {
  cursor: pointer;
}
</style>
