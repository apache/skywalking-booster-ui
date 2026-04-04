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
    <Selector
      class="filter-selector"
      :multiple="true"
      :value="serviceInstanceIds"
      size="small"
      :options="instances"
      placeholder="Select instances"
      @change="changeInstances"
    />
    <el-button type="primary" size="small" @click="analyzeProfiling">
      {{ t("analyze") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
  import { computed, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import { usePprofStore } from "@/store/modules/pprof";
  import type { Instance } from "@/types/selector";
  import type { Option } from "@/types/app";

  const { t } = useI18n();
  const pprofStore = usePprofStore();
  const serviceInstanceIds = ref<string[]>([]);
  const instances = computed(() =>
    pprofStore.instances.filter((d: Instance) =>
      (pprofStore.selectedTask?.successInstanceIds || []).includes(d.id || ""),
    ),
  );

  function changeInstances(options: Option[]) {
    serviceInstanceIds.value = options.map((d: Option) => d.value);
    pprofStore.setAnalyzeTrees([]);
  }

  async function analyzeProfiling() {
    const instanceIds = (pprofStore.instances || [])
      .filter((d: Instance) => (serviceInstanceIds.value || []).includes(d.value))
      .map((d: Instance) => d.id || "") as string[];
    const res = await pprofStore.getPprofAnalyze({
      instanceIds,
      taskId: pprofStore.selectedTask?.id || "",
    });
    if ((res as { errors?: string }).errors) {
      ElMessage.error((res as { errors: string }).errors);
    }
  }

  watch(
    () => pprofStore.selectedTask?.successInstanceIds,
    (value) => {
      serviceInstanceIds.value = [...(value || [])];
      pprofStore.setAnalyzeTrees([]);
    },
    { immediate: true },
  );
</script>
<style>
  .filter-selector {
    width: 400px;
    margin-right: 10px;
  }
</style>
