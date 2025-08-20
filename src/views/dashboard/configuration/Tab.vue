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
  <div class="config-item flex-h">
    <div class="config-label flex-h mr-20">{{ t("tabExpressions") }}</div>
    <div class="mt-10" v-for="(child, index) in widgetTabs || []" :key="index">
      <span class="name">{{ child.name }}</span>
      <el-input class="input" size="small" v-model="expressions[child.name]" @change="changeExpression(child.name)" />
    </div>
  </div>
  <ConfigurationFooter />
</template>
<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { reactive, computed } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { ElMessage } from "element-plus";
  import { WidgetType, ListEntity } from "@/views/dashboard/data";
  import type { LayoutConfig } from "@/types/dashboard";
  import ConfigurationFooter from "./components/ConfigurationFooter.vue";
  import "./style.scss";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const originConfig = dashboardStore.selectedGrid;
  const expressions = reactive<{ [key: string]: string }>({});
  const widgetTabs = computed(() =>
    (dashboardStore.selectedGrid?.children || []).filter((child: any) =>
      child.children.find(
        (item: any) =>
          item.type === WidgetType.Widget &&
          !(Object.keys(ListEntity).includes(item.graph.type as string) && child.children.length === 1),
      ),
    ),
  );

  for (const child of originConfig?.children || []) {
    expressions[child.name] = child.expression || "";
  }
  function changeExpression(name: string) {
    if (expressions[name] && !expressions[name].includes("is_present")) {
      ElMessage.error("Only support the is_present function");
      return;
    }
    const children = JSON.parse(JSON.stringify(dashboardStore.selectedGrid?.children || []));

    for (const item of children) {
      if (item.name === name) {
        item.expression = expressions[name];
      }
    }

    dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, children } as LayoutConfig);
  }
</script>
<style lang="scss" scoped>
  .input {
    width: 500px;
  }

  .name {
    width: 180px;
    display: inline-block;
  }
</style>
