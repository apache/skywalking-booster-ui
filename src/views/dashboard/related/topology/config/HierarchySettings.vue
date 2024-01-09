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
  <div class="hierarchy-services-settings">
    <h5 class="title">{{ t("hierarchyServicesSettings") }}</h5>
    <div class="label">{{ t("layer") }}</div>
    <Selector
      :value="currentConfig.layer || ''"
      :options="layers"
      size="small"
      placeholder="Please select a layer"
      @change="changeLayer"
      class="inputs"
    />
    <div class="label">{{ t("nodeMetrics") }}</div>
    <el-popover placement="left" :width="400" trigger="click">
      <template #reference>
        <span>
          <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
        </span>
      </template>
      <Metrics :type="'hierarchyServicesConfig'" :isExpression="true" @update="updateSettings" />
    </el-popover>
    <Tags
      :tags="currentConfig.nodeExpressions"
      :vertical="true"
      :text="t('addExpressions')"
      @change="(param) => changeNodeExpressions(param)"
    />
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import type { HierarchyServicesConfig } from "@/types/dashboard";
  import type { Node } from "@/types/topology";
  import type { Option } from "@/types/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useTopologyStore } from "@/store/modules/topology";

  const emits = defineEmits(["update"]);
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const topologyStore = useTopologyStore();
  const { hierarchyServicesConfig } = dashboardStore.selectedGrid;
  const layers = computed<Option[]>(() => {
    const map = new Map();
    const arr = topologyStore.nodes.reduce((prev: Option[], next: Node) => {
      if (next.layer && !map.get(next.layer)) {
        map.set(next.layer, true);
        prev.push({ value: next.layer, label: next.layer });
      }
      return prev;
    }, []);
    return arr;
  });
  const currentConfig = ref<HierarchyServicesConfig>(hierarchyServicesConfig(0) || {});

  function changeLayer(opt: Option[]) {
    const { hierarchyServicesConfig } = dashboardStore.selectedGrid;
    const layer = opt[0].value;

    currentConfig.value = hierarchyServicesConfig.value.find((d: HierarchyServicesConfig) => d.layer === layer) || {};
  }

  function changeNodeExpressions(param: string[]) {
    currentConfig.value.nodeExpressions = param;
  }

  function updateSettings() {
    const param = {
      ...dashboardStore.selectedGrid,
      hierarchyServicesConfig: currentConfig.value,
    };
    dashboardStore.selectWidget(param);
    dashboardStore.setConfigs(param);
    emits("update", param);
  }
</script>
<style lang="scss" scoped>
  .title {
    color: var(--sw-topology-color);
    margin-bottom: 0;
  }

  .label {
    font-size: $font-size-smaller;
    margin-top: 10px;
    color: var(--sw-topology-color);
  }

  .inputs {
    margin-top: 8px;
    width: 270px;
  }
</style>
