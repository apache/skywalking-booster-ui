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
  <div class="flex-h header">
    <div class="title">Async Profiling</div>
    <el-button class="mr-20" size="small" type="primary" @click="() => (newTask = true)">
      {{ t("newTask") }}
    </el-button>
  </div>
  <el-dialog v-model="newTask" :destroy-on-close="true" fullscreen @closed="newTask = false">
    <NewTask @close="newTask = false" />
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import NewTask from "./components/NewTask.vue";

  const { t } = useI18n();
  const newTask = ref<boolean>(false);
</script>
<style lang="scss" scoped>
  .header {
    padding: 10px;
    font-size: $font-size-smaller;
    border-bottom: 1px solid $border-color;
    justify-content: space-between;
  }

  .name {
    width: 270px;
  }

  .title {
    font-weight: bold;
    line-height: 24px;
  }
</style>
