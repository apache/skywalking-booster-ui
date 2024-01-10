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
    <div class="label" v-if="currentConfig.layer">
      <span>{{ t("nodeMetrics") }}</span>
      <el-popover placement="left" :width="400" trigger="click">
        <template #reference>
          <span>
            <Icon class="cp ml-5" iconName="mode_edit" size="middle" />
          </span>
        </template>
        <Metrics :type="'hierarchyServicesConfig'" :layer="currentConfig.layer" @update="updateSettings" />
      </el-popover>
    </div>
    <div v-if="currentConfig.layer">
      <Tags
        :tags="currentConfig.nodeExpressions || []"
        :vertical="true"
        :text="t('addExpressions')"
        @change="(param) => changeNodeExpressions(param)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import type { HierarchyServicesConfig, MetricConfigOpt } from "@/types/dashboard";
  import type { Node } from "@/types/topology";
  import type { Option } from "@/types/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useTopologyStore } from "@/store/modules/topology";
  import { useSelectorStore } from "@/store/modules/selectors";
  import Metrics from "./Metrics.vue";

  const emits = defineEmits(["update"]);
  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const topologyStore = useTopologyStore();
  const selectorStore = useSelectorStore();
  const hierarchyServicesConfig = dashboardStore.selectedGrid.hierarchyServicesConfig || [];
  const currentConfig = reactive<HierarchyServicesConfig>(hierarchyServicesConfig[0] || {});
  const layers = ref<Option[]>([]);

  onMounted(() => {
    setLayers();
  });
  function changeLayer(opt: Option[]) {
    const hierarchyServicesConfig = dashboardStore.selectedGrid.hierarchyServicesConfig || [];
    const layer = opt[0].value;
    const config = hierarchyServicesConfig.find((d: HierarchyServicesConfig) => d.layer === layer) || {};
    currentConfig.layer = layer;
    currentConfig.nodeExpressions = config.nodeExpressions || [];
  }

  function changeNodeExpressions(param: string[]) {
    currentConfig.nodeExpressions = param;
    updateSettings();
    if (!param.length) {
      topologyStore.setHierarchyServiceNode({}, currentConfig.layer);
      return;
    }
    topologyStore.queryHierarchyNodeExpressions(param, currentConfig.layer);
  }

  function updateSettings(metricConfig?: { [key: string]: MetricConfigOpt[] }) {
    if (metricConfig) {
      currentConfig.expressionsConfig = Object.values(metricConfig)[0];
    }
    const config = dashboardStore.selectedGrid.hierarchyServicesConfig || [];
    const index = config.findIndex((d: HierarchyServicesConfig) => d.layer === currentConfig.layer);
    if (index < 0) {
      config.push(JSON.parse(JSON.stringify(currentConfig)));
    } else {
      config[index] = JSON.parse(JSON.stringify(currentConfig));
    }

    const hierarchyServicesConfig = config.filter((d: HierarchyServicesConfig) => d.layer && d.nodeExpressions);
    const param = {
      ...dashboardStore.selectedGrid,
      hierarchyServicesConfig,
    };

    dashboardStore.selectWidget(param);
    dashboardStore.setConfigs(param);
    emits("update", param);
  }

  async function setLayers() {
    const resp = await selectorStore.fetchLayers();
    if (resp.errors) {
      ElMessage.error(resp.errors);
    }
    layers.value = resp.data.layers.map((d: string) => {
      return { label: d, value: d };
    });
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
