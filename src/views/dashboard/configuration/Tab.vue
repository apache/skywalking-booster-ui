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
  <div class="item">
    <span class="label">{{ t("content") }}</span>
    <div v-for="(exp, index) in expressions" :key="index" class="mb-10">
      <div class="expression-param" contenteditable="true" @blur="changeExpression($event, index)">
        {{ exp }}
      </div>
    </div>
  </div>
  <div class="footer">
    <el-button size="small" @click="cancelConfig">
      {{ t("cancel") }}
    </el-button>
    <el-button size="small" type="primary" @click="applyConfig">
      {{ t("apply") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const originConfig = dashboardStore.selectedGrid;
  const expressions = ref<string[]>(originConfig.expressions || []);

  async function changeExpression(event: any, index: number) {
    const params = (event.target.textContent || "").replace(/\s+/g, "");

    expressions.value[index] = params;
    dashboardStore.selectWidget({
      ...dashboardStore.selectedGrid,
      expressions: expressions.value,
    });
  }
  function changeConfig(param: { [key: string]: unknown }) {
    const { selectedGrid } = dashboardStore;
    const graph = {
      ...selectedGrid.graph,
      ...param,
    };
    dashboardStore.selectWidget({ ...selectedGrid, graph });
  }
  function applyConfig() {
    dashboardStore.setConfigPanel(false);
    dashboardStore.setConfigs(dashboardStore.selectedGrid);
  }

  function cancelConfig() {
    dashboardStore.selectWidget(originConfig);
    dashboardStore.setConfigPanel(false);
  }
</script>
<style lang="scss" scoped>
  .expression-param {
    display: inline-block;
    width: 400px;
    border: 1px solid $border-color;
    cursor: text;
    padding: 0 5px;
    border-radius: 3px;
    outline: none;
    margin-right: 5px;
    min-height: 26px;

    &:focus {
      border-color: $active-color;
    }
  }

  .label {
    font-size: 13px;
    font-weight: 500;
    display: block;
    margin-bottom: 5px;
  }

  .item {
    margin-bottom: 10px;
  }

  .footer {
    position: fixed;
    bottom: 0;
    right: 0;
    border-top: 1px solid $border-color-primary;
    padding: 10px;
    text-align: right;
    width: 100%;
    background-color: $theme-background;
  }
</style>
