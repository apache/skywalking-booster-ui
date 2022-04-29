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
  <section class="app-main flex-v">
    <router-view v-slot="{ Component }" :key="$route.fullPath">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </section>
</template>
<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { useAppStoreWithOut } from "@/store/modules/app";

const appStore = useAppStoreWithOut();
if (!appStore.utc) {
  const res = appStore.queryOAPTimeInfo();

  if (res.errors) {
    ElMessage.error(res.errors);
  }
}
</script>
<style lang="scss" scoped>
.app-main {
  height: 100%;
  max-height: 375px;
  max-width: 800px;
  background: #f7f9fa;
}
</style>
