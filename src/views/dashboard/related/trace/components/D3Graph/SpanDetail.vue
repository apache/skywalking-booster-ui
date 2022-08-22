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
  <div>
    <h5 class="mb-15">{{ t("tags") }}.</h5>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("service") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.serviceCode }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("instance") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.serviceInstanceName }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("endpoint") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.label }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("spanType") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.type }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("component") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.component }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">Peer:</span>
      <span class="g-sm-8 wba">{{ currentSpan.peer || "No Peer" }}</span>
    </div>
    <div class="mb-10 clear item">
      <span class="g-sm-4 grey">{{ t("isError") }}:</span>
      <span class="g-sm-8 wba">{{ currentSpan.isError }}</span>
    </div>
    <div class="mb-10 clear item" v-for="i in currentSpan.tags" :key="i.key">
      <span class="g-sm-4 grey">{{ i.key }}:</span>
      <span class="g-sm-8 wba">
        {{ i.value }}
        <span
          v-if="i.key === 'db.statement' && i.value"
          class="grey link-hover cp ml-5"
          @click="copy(i.value)"
        >
          <Icon size="middle" iconName="review-list" />
        </span>
      </span>
    </div>
    <h5 class="mb-10" v-if="currentSpan.logs" v-show="currentSpan.logs.length">
      {{ t("logs") }}.
    </h5>
    <div v-for="(i, index) in currentSpan.logs" :key="index">
      <div class="mb-10 sm">
        <span class="mr-10">{{ t("time") }}:</span
        ><span class="grey">{{ dateFormat(i.time) }}</span>
      </div>
      <div class="mb-15 clear" v-for="(_i, _index) in i.data" :key="_index">
        <div class="mb-10">
          {{ _i.key }}:<span
            v-if="_i.key === 'stack'"
            class="r rk-sidebox-magnify"
            @click="showCurrentSpanDetail(_i.value)"
          >
            <Icon iconName="magnify" />
          </span>
        </div>
        <pre class="pl-15 mt-0 mb-0 sm oa">{{ _i.value }}</pre>
      </div>
    </div>
    <el-button class="popup-btn" type="primary" @click="getTaceLogs">
      {{ t("relatedTraceLogs") }}
    </el-button>
  </div>
</template>
<script lang="ts" setup>
import { inject } from "vue";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import copy from "@/utils/copy";
import getDashboard from "@/hooks/useDashboardsSession";
import { LayoutConfig } from "@/types/dashboard";
import { dateFormat } from "@/utils/dateFormat";

/*global defineProps, Recordable */
const options: Recordable<LayoutConfig> = inject("options") || {};
const props = defineProps({
  currentSpan: { type: Object as PropType<any>, default: () => ({}) },
});
const { t } = useI18n();
async function getTaceLogs() {
  const { associationWidget } = getDashboard();
  associationWidget(
    (options.id as any) || "",
    {
      sourceId: options?.id || "",
      traceId: props.currentSpan.traceId,
      segmentId: props.currentSpan.segmentId,
      spanId: props.currentSpan.spanId,
    },
    "Log"
  );
}
function showCurrentSpanDetail(text: string) {
  copy(text);
}
</script>
<style lang="scss" scoped>
.popup-btn {
  color: #fff;
  margin-top: 40px;
  width: 100%;
  text-align: center;
}

.item span {
  min-height: 21px;
}

.link-hover {
  cursor: pointer;
}

.link-hover:hover {
  color: #448dfe;
}
</style>
