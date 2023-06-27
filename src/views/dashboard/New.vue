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
  <div class="new-dashboard">
    <div class="title">{{ t("newDashboard") }}</div>
    <div class="item">
      <div class="label">{{ t("name") }}</div>
      <el-input size="default" v-model="states.name" placeholder="Please input name" />
    </div>
    <div class="item">
      <div class="label">{{ t("layer") }}</div>
      <Selector
        v-model="states.selectedLayer"
        :options="states.layers"
        placeholder="Select a layer"
        @change="changeLayer"
        class="selectors"
      />
    </div>
    <div class="item">
      <div class="label">{{ t("entityType") }}</div>
      <Selector
        v-model="states.entity"
        :options="EntityType"
        placeholder="Select a entity"
        @change="changeEntity"
        class="selectors"
      />
    </div>
    <div class="btn">
      <el-button class="create" size="default" type="primary" @click="onCreate">
        {{ t("create") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import router from "@/router";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { EntityType } from "./data";
  import { ElMessage } from "element-plus";
  import { useDashboardStore } from "@/store/modules/dashboard";

  const dashboardStore = useDashboardStore();
  const { t } = useI18n();
  const selectorStore = useSelectorStore();
  const states = reactive({
    name: "",
    selectedLayer: "",
    entity: EntityType[0].value,
    layers: [],
  });
  setLayers();
  dashboardStore.setDashboards();

  const onCreate = () => {
    const index = dashboardStore.dashboards.findIndex(
      (d: { name: string; entity: string; layer: string }) =>
        d.name === states.name && states.entity === d.entity && states.selectedLayer === d.layer,
    );
    if (!states.name) {
      ElMessage.error(t("nameEmptyError"));
      return;
    }
    if (index > -1) {
      ElMessage.error(t("nameError"));
      return;
    }
    dashboardStore.setCurrentDashboard({
      name: states.name,
      entity: states.entity,
      layer: states.selectedLayer,
    });
    const name = states.name;
    const path = `/dashboard/${states.selectedLayer}/${states.entity}/${name}`;
    router.push(path);
  };
  async function setLayers() {
    const resp = await selectorStore.fetchLayers();
    if (resp.errors) {
      ElMessage.error(resp.errors);
    }
    states.selectedLayer = resp.data.layers[0];
    states.layers = resp.data.layers.map((d: string) => {
      return { label: d, value: d };
    });
  }
  function changeLayer(opt: { label: string; value: string }[] | any) {
    states.selectedLayer = opt[0].value;
  }
  function changeEntity(opt: { label: string; value: string }[] | any) {
    states.entity = opt[0].value;
  }
</script>
<style lang="scss" scoped>
  .title {
    font-size: 18px;
    font-weight: bold;
    padding-top: 20px;
  }

  .new-dashboard {
    margin: 0 auto;
  }

  .item {
    margin-top: 20px;
  }

  .new-dashboard,
  .selectors {
    width: 600px;
  }

  .create {
    width: 600px;
  }

  .btn {
    margin-top: 40px;
  }
</style>
