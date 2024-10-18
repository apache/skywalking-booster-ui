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
  <div>
    <span class="label">{{ t("valueMappings") }}</span>
    <span class="label red">{{ t("mappingTip") }}</span>
  </div>
  <div v-for="(key, index) in keys" :key="index" class="mb-10 flex-h">
    <div class="content-decoration" contenteditable="true" @blur="changeKeys($event, index)">
      {{ key }}
    </div>
    <div class="ml-5 mr-10">:</div>
    <div class="content-decoration" contenteditable="true" @blur="changeValues($event, key)">
      {{ valueMappings[key] }}
    </div>
    <div v-if="index === keys.length - 1">
      <Icon class="cp mr-5" iconName="add_circle_outlinecontrol_point" size="middle" @click="addDecoration" />
      <Icon
        v-if="index !== 0"
        class="cp"
        iconName="remove_circle_outline"
        size="middle"
        @click="deleteDecoration(index)"
      />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useI18n } from "vue-i18n";

  const { t } = useI18n();
  const dashboardStore = useDashboardStore();
  const graph = dashboardStore.selectedGrid.graph;
  const valueMappings = ref<{ [key: string]: string }>(graph?.valueMappings || {});
  const keys = ref<string[]>(graph.valueMappings ? Object.keys(valueMappings.value) : [""]);

  function changeKeys(event: any, index: number) {
    const params = event.target.textContent || "";
    const list = Object.keys(valueMappings.value);
    if (params) {
      valueMappings.value[params] = valueMappings.value[list[index]];
    }
    delete valueMappings.value[list[index]];
    keys.value = Object.keys(valueMappings.value);
    if (!keys.value.length) {
      keys.value = [""];
    }
    updateConfig();
  }

  function changeValues(event: any, key: string) {
    valueMappings.value[key] = event.target.textContent || "";
    updateConfig();
  }

  function addDecoration() {
    keys.value.push("");
  }

  function deleteDecoration(index: number) {
    if (!keys.value.length) {
      return;
    }
    delete valueMappings.value[keys.value[index]];
    keys.value.splice(index, 1);
    updateConfig();
  }

  function updateConfig() {
    const graph = {
      ...dashboardStore.selectedGrid.graph,
      valueMappings: valueMappings.value,
    };
    dashboardStore.selectWidget({ ...dashboardStore.selectedGrid, graph });
  }
</script>
<style lang="scss" scoped>
  .content-decoration {
    width: 350px;
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
    padding-right: 10px;
  }
</style>
