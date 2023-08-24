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
      <el-input size="small" class="profile-input" :min="0" v-model="states.minDuration" type="number" />
    </div>
    <div>
      <div class="label">{{ t("when4xx") }}</div>
      <Radio class="mb-5" :value="states.when4xx" :options="InitTaskField.Whenxx" @change="changeWhen4xx" />
    </div>
    <div>
      <div class="label">{{ t("when5xx") }}</div>
      <Radio class="mb-5" :value="states.when5xx" :options="InitTaskField.Whenxx" @change="changeWhen5xx" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import type { PropType } from "vue";
  import { InitTaskField } from "./data";
  import type { NetworkProfilingRequest } from "@/types/ebpf";

  /* global defineEmits, defineProps */
  const emits = defineEmits(["change"]);
  const props = defineProps({
    condition: {
      type: Object as PropType<NetworkProfilingRequest>,
      default: () => ({ children: [] }),
    },
    index: {
      type: Number,
      default: () => 0,
    },
  });
  const { t } = useI18n();
  const states = reactive<NetworkProfilingRequest>(props.condition);

  function changeWhen5xx(value: string) {
    states.when5xx = value;
    emits("change", states, props.index);
  }
  function changeWhen4xx(value: string) {
    states.when4xx = value;
    emits("change", states, props.index);
  }
</script>
<style lang="scss" scoped>
  .date {
    font-size: $font-size-smaller;
  }

  .label {
    margin-top: 10px;
    font-size: $font-size-normal;
  }

  .profile-input {
    width: 300px;
  }
</style>
