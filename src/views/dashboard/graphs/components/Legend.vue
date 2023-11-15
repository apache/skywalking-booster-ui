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
    v-if="tableData.length && config.asTable"
    role="region"
    aria-labelledby="caption"
    tabindex="0"
    :style="`width: ${width}; maxHeight:${isRight ? '100%' : 130}`"
    class="scroll_bar_style"
  >
    <table v-if="tableData.length === 1">
      <thead>
        <tr>
          <th v-show="headerRow.length"></th>
          <th>
            {{ tableData[0].name }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in headerRow" :key="h.value">
          <th>
            {{ h.label }}
          </th>
          <td>
            {{ tableData[0][h.value] }}
          </td>
        </tr>
      </tbody>
    </table>
    <table v-else>
      <thead>
        <tr>
          <th></th>
          <th v-for="h in headerRow" :key="h.value">
            {{ h.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index">
          <th>
            <el-popover placement="bottom" :width="230" trigger="click">
              <template #reference>
                <div class="name">
                  <Icon iconName="circle" :style="`color: ${colors[index]};`" />
                  <i>{{ item.name }}</i>
                </div>
              </template>
              <div class="list">
                <div class="value">
                  <span>{{ t("key") }}</span>
                  <span>{{ t("value") }}</span>
                </div>
                <div class="value" v-for="(d, index) in item.topN" :key="index">
                  <span>{{ d.key }}</span>
                  <span>{{ d.value }}</span>
                </div>
              </div>
            </el-popover>
          </th>
          <td v-for="h in headerRow" :key="h.value">
            {{ item[h.value] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import type { LegendOptions } from "@/types/dashboard";
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
    intervalTime: { type: Array as PropType<string[]>, default: () => [] },
  });
  const { t } = useI18n();
  const tableData: any = computed(() => {
    const { aggregations } = useLegendProcess(props.config);
    return aggregations(props.data, props.intervalTime).source;
  });
  const headerRow = computed(() => {
    const { aggregations } = useLegendProcess(props.config);
    return aggregations(props.data, props.intervalTime).headers;
  });
  const isRight = computed(() => useLegendProcess(props.config).isRight);
  const width = computed(() => (props.config.width ? props.config.width + "px" : isRight.value ? "150px" : "100%"));
  const colors = computed(() => {
    const { chartColors } = useLegendProcess(props.config);
    return chartColors();
  });
</script>
<style lang="scss" scoped>
  table {
    font-size: $font-size-smaller;
    white-space: nowrap;
    margin: 0;
    border: none;
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
  }

  table th {
    padding: 5px;
  }

  table thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    width: 25vw;
    background: $theme-background;
    text-align: left;
  }

  .name {
    cursor: pointer;
  }

  table td {
    padding: 5px;
  }

  table thead th:first-child {
    position: sticky;
    left: 0;
    z-index: 2;
  }

  table tbody th {
    font-weight: bold;
    font-style: normal;
    text-align: left;
    background-color: $theme-background;
    position: sticky;
    left: 0;
    z-index: 1;
  }

  [role="region"][aria-labelledby][tabindex] {
    overflow: auto;
  }

  i {
    font-style: normal;
  }

  .value {
    span {
      display: inline-block;
      padding: 5px;
      width: 80px;
    }
  }

  .list {
    height: 360px;
    overflow: auto;
  }
</style>
