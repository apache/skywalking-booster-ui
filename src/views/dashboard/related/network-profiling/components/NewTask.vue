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
    <el-collapse v-model="activeNames">
      <el-collapse-item
        v-for="(item, index) in conditionsList"
        :key="index"
        :title="`Condition - ${index + 1}`"
      >
        <NewCondition
          :name="index"
          :condition="item"
          :key="index"
          @change="changeConfig"
        />
      </el-collapse-item>
    </el-collapse>
    <div>
      <el-button @click="createTask" type="primary" class="create-task-btn">
        {{ t("createTask") }}
      </el-button>
      <el-button
        @click="createConditions"
        type="primary"
        class="create-task-btn"
      >
        {{ t("createConditions") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { InitTaskField } from "./data";
import NewCondition from "./NewConditions.vue";
import { NetworkProfilingRequest } from "@/types/ebpf";

/* global defineEmits */
const emits = defineEmits(["create"]);
const { t } = useI18n();
const activeNames = ref([1]);
const conditionsList = ref<NetworkProfilingRequest[]>([
  {
    uriRegex: "",
    when4xx: InitTaskField.Whenxx[0].value,
    when5xx: InitTaskField.Whenxx[1].value,
    minDuration: NaN,
  },
]);

function changeConfig(
  params: { [key: string]: number | string },
  index: number
) {
  const key: string = Object.keys(params)[0];
  (conditionsList.value[index] as any)[key] = params[key];
}

function createTask() {
  const list = conditionsList.value.map((d: NetworkProfilingRequest) => {
    return {
      uriRegex: d.uriRegex || undefined,
      when4xx: d.when4xx === InitTaskField.Whenxx[0].value ? true : false,
      when5xx: d.when5xx === InitTaskField.Whenxx[0].value ? true : false,
      minDuration: isNaN(d.minDuration) ? undefined : d.minDuration,
    };
  });
  emits("create", list);
}

function createConditions() {
  console.log(conditionsList);
}
</script>
<style lang="scss" scoped>
.profile-task {
  margin: 0 auto;
  width: 400px;
}

.create-task-btn {
  width: 300px;
  margin-top: 50px;
}
</style>
