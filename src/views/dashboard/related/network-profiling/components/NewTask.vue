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
      <div class="label">{{ t("uriRegex") }}</div>
      <el-input size="small" class="profile-input" v-model="states.uriRegex" />
    </div>
    <div>
      <div class="label">{{ t("minThreshold") }} (ms)</div>
      <el-input-number
        size="small"
        class="profile-input"
        :min="0"
        v-model="states.minDuration"
      />
    </div>
    <div>
      <div class="label">{{ t("monitorTime") }}</div>
      <div>
        <Selector
          size="small"
          :value="states.when4xx"
          :options="InitTaskField.When4xx"
          placeholder="Select a data"
          @change="changeConfig({ when4xx: states.when4xx })"
          class="profile-input"
        />
      </div>
    </div>
    <div>
      <div class="label">{{ t("minThreshold") }} (ms)</div>
      <el-input-number
        size="small"
        class="profile-input"
        :min="0"
        v-model="states.minDuration"
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
const emits = defineEmits(["close"]);
const { t } = useI18n();
const states = reactive<any>({
  uriRegex: "",
  when4xx: true,
  minDuration: NaN,
});

function changeConfig(params: { [key: string]: unknown }) {
  const key = Object.keys(params)[0];
  states[key] = params[key];
}

async function createTask() {
  emits("close");
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
