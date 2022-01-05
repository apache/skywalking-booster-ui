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
    <span class="label">{{ t("title") }}</span>
    <el-input
      class="input"
      v-model="state.unit"
      size="mini"
      placeholder="Please input Unit"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("max") }}</span>
    <el-input
      class="input"
      v-model="state.max"
      size="mini"
      placeholder="auto"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("min") }}</span>
    <el-input
      class="input"
      v-model="state.min"
      size="mini"
      placeholder="auto"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("plus") }}</span>
    <el-input
      class="input"
      v-model="state.plus"
      size="mini"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("minus") }}</span>
    <el-input
      class="input"
      v-model="state.minus"
      size="mini"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("multiply") }}</span>
    <el-input
      class="input"
      v-model="state.multiply"
      size="mini"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("divide") }}</span>
    <el-input
      class="input"
      v-model="state.divide"
      size="mini"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToMilliseconds") }}</span>
    <el-input
      class="input"
      v-model="state.milliseconds"
      size="mini"
      placeholder="none"
    />
  </div>
  <div class="item">
    <span class="label">{{ t("convertToSeconds") }}</span>
    <el-input
      class="input"
      v-model="state.seconds"
      size="mini"
      placeholder="none"
    />
  </div>
</template>
<script lang="ts" setup>
import { ElInput } from "element-plus";
import { reactive } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const state = reactive({
  unit: "",
  max: "",
  min: "",
  plus: "",
  minus: "",
  multiply: "",
  divide: "",
  milliseconds: "",
  seconds: "",
});
</script>
<style lang="scss" scoped>
.label {
  font-size: 13px;
  font-weight: 500;
  display: block;
  margin-bottom: 5px;
}

.input {
  width: 500px;
}

.item {
  margin-bottom: 10px;
}
</style>
