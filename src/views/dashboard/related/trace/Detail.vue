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
  <div class="trace-detail" v-loading="loading">
    <div :class="{ 'full-view': isFullView }" class="trace-chart">
      <component
        v-if="traceStore.currentTrace.endpointNames"
        :is="traceStore.displayMode"
        :data="traceStore.traceSpans"
        :traceId="traceStore.currentTrace.traceIds[0].value"
        :showBtnDetail="false"
        HeaderType="trace"
      />
    </div>
  </div>
</template>
<script lang="ts">
import dayjs from "dayjs";
import { ref, computed, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useTraceStore } from "@/store/modules/trace";
import { Option } from "@/types/app";
import copy from "@/utils/copy";
import List from "./components/List.vue";
import graphs from "./components/index";
import LogTable from "@/views/dashboard/related/components/LogTable/Index.vue";
import { ElMessage } from "element-plus";
// import TraceDetailsTools from '@/views/dashboard'
export default defineComponent({
  name: "TraceDetail",
  components: {
    ...graphs,
    List,
    LogTable,
  },
  setup(props, ctx) {
    const { t } = useI18n();
    const traceStore = useTraceStore();
    const loading = ref<boolean>(false);
    const traceId = ref<string>("");
    const queries = useRoute().query;    
    const isFullView = computed(() => {
      return queries?.fullview === "true" && queries?.portal === "true";
    })  
    const displayMode = computed(() => {
      return traceStore.displayMode;
    });
    const pageNum = ref<number>(1);
    const pageSize = 10;
    const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") =>
      dayjs(date).format(pattern);
    const showTraceLogs = ref<boolean>(false);

    function showTraceList() {
      ctx.emit("show:list");
    }
    function handleClick(ids: string[] | any) {
      let copyValue = null;
      if (ids.length === 1) {
        copyValue = ids[0];
      } else {
        copyValue = ids.join(",");
      }
      copy(copyValue);
    }

    async function changeTraceId(opt: Option[] | any) {
      traceId.value = opt[0].value;
      loading.value = true;
      const res = await traceStore.getTraceSpans({ traceId: opt[0].value });
      if (res.errors) {
        ElMessage.error(res.errors);
      }
      loading.value = false;
    }

    async function searchTraceLogs() {
      showTraceLogs.value = true;
      const res = await traceStore.getSpanLogs({
        condition: {
          relatedTrace: {
            traceId: traceId.value || traceStore.currentTrace.traceIds[0].value,
          },
          paging: { pageNum: pageNum.value, pageSize, needTotal: true },
        },
      });
      if (res.errors) {
        ElMessage.error(res.errors);
      }
    }

    function turnLogsPage(page: number) {
      pageNum.value = page;
      searchTraceLogs();
    }
    return {
      isFullView,
      showTraceList,
      traceStore,
      displayMode,
      dateFormat,
      changeTraceId,
      handleClick,
      t,
      searchTraceLogs,
      showTraceLogs,
      turnLogsPage,
      pageSize,
      pageNum,
      loading,
    };
  },
});
</script>
<style lang="scss" scoped>
.trace-detail {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.trace-chart {
  height: calc(100% - 100px);
  overflow: auto;
  padding-bottom: 20px;
}
.trace-chart.full-view{
  height: calc(100% - 1px) !important;
}
.trace-detail-wrapper {
  font-size: 12px;
  padding: 5px 10px;
  border-bottom: 1px solid #eee;
  width: 100%;
  height: 95px;

  .grey {
    color: #fff;
    background-color: #448dfe;
  }

  .ghost {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.3);
  }
}

.item {
  justify-content: space-between;
}

.trace-detail-ids {
  background-color: rgba(0, 0, 0, 0);
  outline: 0;
  border-style: unset;
  color: inherit;
  border: 1px solid;
  border-radius: 4px;
  width: 300px;
}

.trace-log-btn {
  float: right;
}

.tag {
  display: inline-block;
  border-radius: 4px;
  padding: 0px 7px;
  background-color: #40454e;
  color: #eee;
}

.no-data {
  padding-top: 50px;
  width: 100%;
  text-align: center;
}
</style>
