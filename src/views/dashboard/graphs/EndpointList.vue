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
  <el-table
    :data="selectorStore.endpoints"
    style="width: 100%; height: 100%; overflow: auto"
  >
    <el-table-column label="Endpoints">
      <template #default="scope">
        <span class="link" @click="linkInstance(scope.row)">
          {{ scope.row.label }}
        </span>
      </template>
    </el-table-column>
  </el-table>
</template>
<script setup lang="ts">
import { defineProps, onBeforeMount } from "vue";
import { useSelectorStore } from "@/store/modules/selectors";
import { ElMessage } from "element-plus";
import router from "@/router";

defineProps({
  data: {
    type: Object,
  },
  config: {
    type: Object,
    default: () => ({}),
  },
});
const selectorStore = useSelectorStore();

onBeforeMount(async () => {
  const resp = await selectorStore.getEndpoints();

  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
});
function linkInstance(row: any) {
  const path = `/dashboard/view/${row.layer}/endpoint/${selectorStore.currentService}/${row.value}`;
  router.push(path);
}
</script>
<style lang="scss" scoped>
.link {
  cursor: pointer;
  color: #409eff;
  display: inline-block;
  width: 100%;
}
</style>
