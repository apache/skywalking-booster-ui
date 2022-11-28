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
  <div class="profile-task">
    <div>
      <div class="label">URI Regex</div>
      <el-input size="small" class="profile-input" v-model="states.uriRegex" />
    </div>
    <div>
      <div class="label">{{ t("minDuration") }} (ms)</div>
      <el-input-number
        size="small"
        class="profile-input"
        :min="0"
        v-model="states.minDuration"
      />
    </div>
    <div>
      <div class="label">When4xx</div>
      <Radio
        class="mb-5"
        :value="states.when4xx"
        :options="InitTaskField.Whenxx"
        @change="changeConfig({ when4xx: $event })"
      />
    </div>
    <div>
      <div class="label">When5xx</div>
      <Radio
        class="mb-5"
        :value="states.when5xx"
        :options="InitTaskField.Whenxx"
        @change="changeConfig({ when5xx: $event })"
      />
    </div>
    <div>
      <el-button @click="createTask" type="primary" class="create-task-btn">
        {{ t("createTask") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";
import { useI18n } from "vue-i18n";
import { InitTaskField } from "./data";
/* global defineEmits */
const emits = defineEmits(["create"]);
const { t } = useI18n();
const states = reactive<{
  uriRegex: string;
  when4xx: string;
  when5xx: string;
  minDuration: number;
}>({
  uriRegex: "",
  when4xx: InitTaskField.Whenxx[0].value,
  when5xx: InitTaskField.Whenxx[1].value,
  minDuration: NaN,
});

function changeConfig(params: { [key: string]: number | string }) {
  const key: string = Object.keys(params)[0];
  (states as any)[key] = params[key];
}

function createTask() {
  emits("create", {
    uriRegex: states.uriRegex || undefined,
    when4xx: states.when4xx === InitTaskField.Whenxx[0].value ? true : false,
    when5xx: states.when5xx === InitTaskField.Whenxx[0].value ? true : false,
    minDuration: isNaN(states.minDuration) ? undefined : states.minDuration,
  });
}
</script>
<style lang="scss" scoped>
.profile-task {
  margin: 0 auto;
  width: 400px;
}

.date {
  font-size: 12px;
}

.label {
  margin-top: 10px;
  font-size: 14px;
}

.profile-input {
  width: 300px;
}

.create-task-btn {
  width: 300px;
  margin-top: 50px;
}
</style>
