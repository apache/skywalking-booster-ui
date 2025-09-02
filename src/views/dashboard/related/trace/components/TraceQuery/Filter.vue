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
  <div class="flex-h trace-query-filter">
    <ConditionTags :type="'TRACE'" @update="updateTags" />
    <div class="flex-h">
      <div class="mr-10">
        <span class="grey mr-5">{{ t("limit") }}</span>
        <el-input-number size="small" v-model="limit" :min="10" @change="handleChangeLimit" />
      </div>
      <el-button size="small" @click="queryTraces"> {{ t("runQuery") }} </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import ConditionTags from "@/views/components/ConditionTags.vue";

  const { t } = useI18n();
  const limit = ref(10);

  function updateTags(tags: string[]) {
    console.log(tags);
  }
  function queryTraces() {
    console.log("queryTraces");
  }
  function handleChangeLimit(value: number | undefined) {
    console.log("handleChangeLimit", value);
  }
</script>
<style lang="scss" scoped>
  .trace-query-filter {
    justify-content: space-between;
  }
</style>
