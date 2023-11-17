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
  <div class="log">
    <div class="log-header flex-h" :class="type === 'browser' ? ['browser-header', 'flex-h'] : 'service-header'">
      <template v-for="(item, index) in columns" :key="`col${index}`">
        <div :class="[item.label, ['message', 'stack'].includes(item.label) ? 'max-item' : '']">
          {{ item.value && t(item.value) }}
        </div>
      </template>
    </div>
    <div v-if="type === 'browser'">
      <LogBrowser v-for="(item, index) in tableData" :data="item" :key="'browser' + index" @select="setCurrentLog" />
    </div>
    <div v-else>
      <LogService
        v-for="(item, index) in tableData"
        :data="item"
        :key="'service' + index"
        :noLink="noLink"
        @select="setCurrentLog"
      />
    </div>
    <slot></slot>
    <el-dialog
      v-model="showDetail"
      :destroy-on-close="true"
      fullscreen
      @closed="showDetail = false"
      :title="t('logDetail')"
    >
      <LogDetail :currentLog="currentLog" />
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { ServiceLogConstants, BrowserLogConstants } from "./data";
  import LogBrowser from "./LogBrowser.vue";
  import LogService from "./LogService.vue";
  import LogDetail from "./LogDetail.vue";

  /*global defineProps */
  const props = defineProps({
    type: { type: String, default: "service" },
    tableData: { type: Array, default: () => [] },
    noLink: { type: Boolean, default: true },
  });
  const { t } = useI18n();
  const currentLog = ref<any>({});
  const showDetail = ref<boolean>(false);
  const columns: any[] = props.type === "browser" ? BrowserLogConstants : ServiceLogConstants;

  function setCurrentLog(log: any) {
    showDetail.value = true;
    currentLog.value = log;
  }
</script>
<style lang="scss" scoped>
  .log {
    font-size: $font-size-smaller;
    height: 100%;
    border-bottom: 1px solid $border-color-primary;
    width: 100%;
    overflow: auto;
  }

  .log-header {
    width: 100%;
    white-space: nowrap;
    user-select: none;
    border-left: 0;
    border-right: 0;
    border-bottom: 1px solid var(--sw-trace-list-border);

    .traceId {
      width: 20px;
    }

    .content {
      width: 1300px;
    }

    .tags {
      width: 15px;
    }

    .serviceName {
      width: 200px;
    }
  }

  .log-header div {
    padding: 0 5px;
    border: 1px solid transparent;
    line-height: 30px;
    background-color: var(--sw-table-header);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .browser-header {
    div {
      min-width: 140px;
      width: 10%;
    }

    .max-item {
      width: 20%;
    }
  }

  .service-header div {
    width: 140px;
  }
</style>
