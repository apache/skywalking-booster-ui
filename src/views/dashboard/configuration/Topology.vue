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
  <WidgetOptions />
  <StyleOptions />
  <div class="footer">
    <el-button size="small">
      {{ t("cancel") }}
    </el-button>
    <el-button size="small" type="primary" @click="applyConfig">
      {{ t("apply") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import WidgetOptions from "./components/WidgetOptions.vue";
import StyleOptions from "./topology/StyleOptions.vue";
import { useDashboardStore } from "@/store/modules/dashboard";

const { t } = useI18n();
const dashboardStore = useDashboardStore();

function applyConfig() {
  dashboardStore.setConfigs(dashboardStore.selectedGrid);
  dashboardStore.setConfigPanel(false);
}
</script>
<style lang="scss" scoped>
.footer {
  position: fixed;
  bottom: 0;
  right: 0;
  border-top: 1px solid #eee;
  padding: 10px;
  text-align: right;
  width: 100%;
  background-color: #fff;
}
</style>
