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
    <div class="mr-10">
      <span class="grey mr-5">{{ t("endpointName") }}:</span>
      <Selector
        class="name"
        size="small"
        :value="endpointName"
        :options="profileStore.endpoints"
        placeholder="Select a endpoint"
        :isRemote="true"
        @change="changeEndpoint"
        @query="searchEndpoints"
      />
    </div>
    <el-button class="search-btn" size="small" type="primary" @click="searchTasks">
      {{ t("search") }}
    </el-button>
    <el-button class="search-btn" size="small" @click="createTask">
      {{ t("newTask") }}
    </el-button>
  </div>
  <el-dialog v-model="newTask" :destroy-on-close="true" fullscreen @closed="newTask = false">
    <NewTask @close="newTask = false" />
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useProfileStore } from "@/store/modules/profile";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { ElMessage } from "element-plus";
  import NewTask from "./components/NewTask.vue";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { EntityType } from "../../data";

  /*global defineProps */
  const props = defineProps({
    needQuery: { type: Boolean, default: true },
  });
  const profileStore = useProfileStore();
  const appStore = useAppStoreWithOut();
  const selectorStore = useSelectorStore();
  const dashboardStore = useDashboardStore();
  const { t } = useI18n();
  const endpointName = ref<string>("");
  const newTask = ref<boolean>(false);

  if (props.needQuery) {
    searchTasks();
    searchEndpoints("");
  }

  async function searchEndpoints(keyword: string) {
    if (!selectorStore.currentService) {
      return;
    }
    const service = selectorStore.currentService.id;
    const res = await profileStore.getEndpoints(service, keyword);

    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    endpointName.value = profileStore.endpoints[0].value;
  }

  function changeEndpoint(opt: any[]) {
    endpointName.value = opt[0].value;
  }

  async function searchTasks() {
    profileStore.setConditions({
      serviceId: (selectorStore.currentService && selectorStore.currentService.id) || "",
      endpointName: endpointName.value,
    });
    const res = await profileStore.getTaskList();

    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  function createTask() {
    newTask.value = true;
  }

  watch(
    () => selectorStore.currentService,
    () => {
      searchTasks();
    },
  );
  watch(
    () => appStore.durationTime,
    () => {
      if (dashboardStore.entity === EntityType[1].value) {
        searchTasks();
      }
    },
  );
</script>
<style lang="scss" scoped>
  .header {
    padding: 10px;
    font-size: $font-size-smaller;
    border-bottom: 1px solid $border-color;
  }

  .name {
    width: 270px;
  }
</style>
