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
  <div class="policy-list">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item
        v-for="(item, index) in continousProfilingStore.strategyList"
        :key="index"
        :title="`Policy${index + 1}`"
        :name="index"
      >
        <Policy :data="item" @edit="changePolicy" :order="index" />
      </el-collapse-item>
    </el-collapse>
    <div>
      <el-button @click="save" type="primary" class="save-btn">
        {{ t("save") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import Policy from "./Policy.vue";
  import type { StrategyItem } from "@/types/continous-profiling";

  /* global defineEmits */
  const emits = defineEmits(["save"]);
  const { t } = useI18n();
  const continousProfilingStore = useContinousProfilingStore();
  const activeNames = ref<string[]>(["1"]);
  const requestParams = ref<StrategyItem[]>([]);

  function changePolicy(params: StrategyItem, order: number) {
    requestParams.value = requestParams.value.map((d: StrategyItem, index: number) => {
      if (order === index) {
        return params;
      }
      return d;
    });
  }

  function save() {
    emits("save", requestParams.value);
  }

  function handleChange(val: any) {
    activeNames.value = val;
  }
</script>
<style lang="scss" scoped>
  .policy-list {
    margin: 0 auto;
    width: 300px;
  }

  .save-btn {
    width: 300px;
    margin-top: 50px;
  }

  .title {
    display: inline-block;
    margin-right: 5px;
  }
</style>
