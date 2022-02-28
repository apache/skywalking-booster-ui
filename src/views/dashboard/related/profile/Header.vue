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
  <div class="flex-h">
    <div class="mr-5">
      <span class="grey mr-5">{{ t("service") }}:</span>
      <Selector
        size="small"
        :value="service.value"
        :options="profileStore.services"
        placeholder="Select a service"
        @change="changeService"
      />
    </div>
    <div class="mr-5">
      <span class="sm b grey mr-5">{{ t("endpointName") }}:</span>
      <el-input class="inputs mr-5" v-model="endpointName" />
    </div>
    <el-button
      class="search-btn"
      size="small"
      type="primary"
      @click="searchTasks"
    >
      {{ t("search") }}
    </el-button>
    <el-button class="search-btn" size="small">
      {{ t("newTask") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useProfileStore } from "@/store/modules/profile";

const profileStore = useProfileStore();
const { t } = useI18n();
const service = ref<any>({});
const endpointName = ref<string>("");

function changeService(opt: any[]) {
  service.value = opt[0];
}
function searchTasks() {
  profileStore.setConditions({
    serviceId: service.value.id,
    endpointName: endpointName.value,
  });
}
</script>
