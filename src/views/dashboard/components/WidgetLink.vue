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
<template lang="">
  <div>
    <div>
      <label>{{ t("setDuration") }}</label>
      <el-switch v-model="hasDuration" />
    </div>
    <div>
      <span class="link">{{ widgetLink }}</span>
      <el-button type="primary">{{ t("generateLink") }}</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";

  const hasDuration = ref<boolean>(false);
  const widgetLink = ref<string>("");
</script>
<style lang="scss" scoped>
  .link {
    color: #999;
  }
</style>
