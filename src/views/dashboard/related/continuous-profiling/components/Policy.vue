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
    <div class="label">{{ t("type") }}</div>
    <Selector
      class="profile-input"
      size="small"
      :value="states.type"
      :options="TargetTypes"
      placeholder="Select a type"
      @change="changeType"
    />
  </div>
  <div v-for="(item, index) in states.checkItems" :key="index">
    <div>
      <div class="label">{{ t("type") }}</div>
      <Selector
        class="profile-input"
        size="small"
        :value="item.type"
        :options="MonitorType"
        placeholder="Select a type"
        @change="changeMonitorType($event, index)"
      />
    </div>
    <div>
      <div class="label">{{ t("count") }}</div>
      <el-input size="small" class="profile-input" :min="0" v-model="item.count" type="number" />
    </div>
    <div>
      <div class="label">{{ t("threshold") }}</div>
      <el-input size="small" class="profile-input" v-model="item.threshold" />
    </div>
    <div>
      <div class="label">{{ t("period") }}</div>
      <el-input size="small" class="profile-input" :min="0" v-model="item.period" type="number" />
    </div>
    <div>
      <div class="label">{{ t("uriRegex") }}</div>
      <el-input size="small" class="profile-input" v-model="item.uriRegex" />
    </div>
    <div>
      <div class="label">{{ t("uriRegex") }}</div>
      <el-input size="small" class="profile-input" v-model="item.uriRegex" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import type { StrategyItem } from "@/types/continous-profiling";
  import { MonitorType, TargetTypes } from "../data";

  /* global defineEmits, defineProps */
  const props = defineProps({
    data: {
      type: Object as PropType<StrategyItem>,
      default: () => ({}),
    },
  });
  const emits = defineEmits(["save"]);
  const { t } = useI18n();
  const states = reactive<StrategyItem>(props.data);

  function changeType(opt: any[]) {
    states.type = (opt.map((d) => d.value)[0] || {}).value;
    emits("save", states);
  }

  function changeMonitorType(opt: any[], index: number) {
    states.checkItems[index].type = (opt.map((d) => d.value)[0] || {}).value;
    emits("save", states);
  }
</script>
<style lang="scss" scoped>
  .profile-task {
    width: 100%;
  }

  .create-task-btn {
    width: 300px;
    margin-top: 50px;
  }

  .title {
    display: inline-block;
    margin-right: 5px;
  }
</style>
