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
  <div class="log-detail-chart-table">
    <div class="rk-log-t-loading" v-show="loading">
      <svg class="icon loading">
        <use xlink:href="#spinner"></use>
      </svg>
    </div>
    <LogTable :tableData="data" :type="`service`" :noLink="noLink">
      <div class="log-tips" v-if="!data.length">{{ $t("noData") }}</div>
    </LogTable>
    <el-dialog
      v-model="showDetail"
      :destroy-on-close="true"
      :width="800"
      @closed="showDetail = false"
      :title="t('logDetail')"
    >
      <LogDetail :currentLog="currentLog" />
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import LogTable from "@/views/components/LogTable/Index.vue";
import { ServiceLogDetail } from "@/views/components/LogTable/data";
import { formatJson } from "@/utils/formatJson";
// import LogDetail from "./LogDetail.vue";

/*global defineProps */
const props = defineProps({
  data: { type: Array, default: () => [] },
  noLink: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});
const showDetail = ref<boolean>(false);
const { t } = useI18n();
const columns = ServiceLogDetail;
const currentLog = ref<any>({});
const logContent = ref<string>("");

function handleSelectLog(data: any) {
  currentLog.value = data;
  if (currentLog.value.contentType === "JSON") {
    logContent.value = formatJson(JSON.parse(this.currentLog.content));
  } else {
    logContent.value = this.currentLog.content;
  }
  this.showDetail = true;
}
</script>
