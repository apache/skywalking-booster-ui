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
  <div class="chart-table" v-if="dataKeys.length">
    <div class="row header flex-h">
      <div
        v-for="key in dataKeys[0]"
        :key="key"
        class="name"
        :style="`width: ${dataKeys[0].length > 1 ? (nameWidth as number) / (dataKeys[0].length || 1) : nameWidth}%`"
      >
        {{ key.split("=")[0] || t("name") }}
      </div>
      <div class="value-col" v-if="config.showTableValues">
        {{ config.tableHeaderCol2 || t("value") }}
      </div>
    </div>
    <div class="row flex-h" v-for="(keys, index) in dataKeys" :key="index">
      <div
        v-for="k in keys"
        class="name"
        :style="`width: ${keys.length > 1 ? (nameWidth as number) / (keys.length || 1) : nameWidth}%`"
        :key="k"
        >{{ k.split("=")[1] }}</div
      >
      <div class="value-col" v-if="config.showTableValues">
        {{ getColValue(keys) }}
      </div>
    </div>
  </div>
  <div class="table-no-data" v-else>No Data</div>
</template>
<script lang="ts" setup>
  import { computed } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";

  /*global defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<{ [key: string]: number[] }>,
      default: () => ({}),
    },
    config: {
      type: Object as PropType<{
        showTableValues: boolean;
        tableHeaderCol2: string;
        typesOfMQE: string[];
        valueMappings: {};
      }>,
      default: () => ({ showTableValues: true }),
    },
  });

  const { t } = useI18n();
  const valueMappings = computed<{ [key: string]: string }>(() => props.config.valueMappings || {});
  const nameWidth = computed(() => (props.config.showTableValues ? 80 : 100));
  const dataKeys = computed(() => {
    const keys = Object.keys(props.data || {}).filter(
      (i: string) => Array.isArray(props.data[i]) && props.data[i].length,
    );
    const list = keys.map((d: string) => d.split(","));

    return list;
  });

  function getColValue(keys: string[]) {
    const source = props.data[(keys as string[]).join(",")][props.data[(keys as string[]).join(",")].length - 1 || 0];
    if (valueMappings.value[source]) {
      return valueMappings.value[source];
    }
    const list = Object.keys(valueMappings.value);
    for (const i of list) {
      try {
        if (new RegExp(i).test(String(source))) {
          return valueMappings.value[i] || source;
        }
      } catch (e) {
        ElMessage.error("invalid regex string");
        return source;
      }
    }
    return source;
  }
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
      border-left: 1px solid $disabled-color;
      height: 20px;
      width: 100%;

      div {
        overflow: hidden;
        text-overflow: ellipsis;
        border-right: 1px solid $disabled-color;
        text-align: center;
        height: 20px;
        line-height: 20px;
        display: inline-block;
      }

      div:last-child {
        border-bottom: 1px solid $disabled-color;
      }

      div:first-child {
        border-bottom: 1px solid $disabled-color;
      }

      div:nth-last-child(2) {
        border-bottom: 1px solid $disabled-color;
      }
    }

    .dark {
      color: #eee;
    }

    .row:first-child {
      div {
        border-top: 1px solid $disabled-color;
        background-color: var(--border-color-primary);
      }
    }

    .header {
      color: var(--sw-table-color);
      font-weight: bold;
    }

    .value-col {
      width: 50%;
    }
  }

  .table-no-data {
    font-size: $font-size-smaller;
    height: 100%;
    align-items: center;
    justify-content: center;
    display: flex;
    color: var(--text-color-placeholder);
  }
</style>
