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
  <div class="trace-t flex-v">
    <div class="trace-t-tool flex-h">
      <el-pagination
        v-model:currentPage="traceStore.conditions.paging.pageNum"
        v-model:page-size="pageSize"
        :small="true"
        layout="prev, pager, next"
        :pager-count="5"
        :total="total"
        @current-change="updatePage"
      />
      <div class="selectors">
        <Selector
          size="small"
          :value="traceStore.conditions.queryOrder"
          :options="QueryOrders"
          placeholder="Select a option"
          @change="changeSort"
        />
      </div>
    </div>
    <div class="trace-t-wrapper" v-loading="loading">
      <table class="list" v-if="traceStore.traceList.length">
        <tr
          class="trace-tr cp"
          v-for="(i, index) in traceStore.traceList"
          @click="selectTrace(i)"
          :key="index"
        >
          <td
            class="trace-td"
            :class="{
              'trace-success': !i.isError,
              'trace-error': i.isError,
              selected: selectedKey == i.key,
            }"
          >
            <div
              class="ell mb-5"
              :class="{
                blue: !i.isError,
                red: i.isError,
              }"
            >
              <span class="b">{{ i.endpointNames[0] }}</span>
            </div>
            <div class="grey ell sm">
              <span class="tag mr-10 sm">{{ i.duration }} ms</span
              >{{ dateFormat(parseInt(i.start, 10)) }}
            </div>
          </td>
        </tr>
      </table>
      <div class="no-data" v-else>{{ t("noData") }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTraceStore } from "@/store/modules/trace";
import { ElMessage } from "element-plus";
import { QueryOrders } from "../../data";
import { Option } from "@/types/app";
import { Trace } from "@/types/trace";
import { dateFormat } from "@/utils/dateFormat";

const { t } = useI18n();
const traceStore = useTraceStore();
const loading = ref<boolean>(false);
const selectedKey = ref<string>("");
const pageSize = ref<number>(20);
const total = computed(() =>
  traceStore.traceList.length === pageSize.value
    ? pageSize.value * traceStore.conditions.paging.pageNum + 1
    : pageSize.value * traceStore.conditions.paging.pageNum
);

function searchTrace() {
  loading.value = true;
  queryTraces();
  loading.value = false;
}

function updatePage(p: number) {
  traceStore.setTraceCondition({
    paging: { pageNum: p, pageSize: pageSize.value },
  });
  searchTrace();
}

function changeSort(opt: Option[] | any) {
  traceStore.setTraceCondition({
    queryOrder: opt[0].value,
    paging: { pageNum: 1, pageSize: pageSize.value },
  });
  searchTrace();
}

async function selectTrace(i: Trace) {
  traceStore.setCurrentTrace(i);
  selectedKey.value = i.key;
  if (i.traceIds.length) {
    const res = await traceStore.getTraceSpans({
      traceId: i.traceIds[0].value,
    });
    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }
}

async function queryTraces() {
  const res = await traceStore.getTraces();
  if (res.errors) {
    ElMessage.error(res.errors);
  }
}
</script>
<style lang="scss" scoped>
.trace-t-tool {
  background-color: rgba(196, 200, 225, 0.2);
  justify-content: space-between;
  border-bottom: 1px solid #c1c5ca41;
  border-right: 1px solid #c1c5ca41;
  height: 35px;
}

.selectors {
  margin: 2px 2px 0 0;
}

.trace-t-wrapper {
  overflow: auto;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.trace-t-loading {
  text-align: center;
  position: absolute;
  width: 420px;
  height: 70px;
  margin-top: 40px;
  line-height: 88px;
  overflow: hidden;

  .icon {
    width: 30px;
    height: 30px;
  }
}

.trace-t {
  width: 420px;
}

.list {
  width: 300px;
}

.trace-tr {
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.trace-td {
  padding: 5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);

  &.selected {
    background-color: #ededed;
  }
}

.trace-success {
  border-left: 4px solid rgba(46, 47, 51, 0.1);
}

.trace-warning {
  border-left: 4px solid #fbb03b;
}

.trace-error {
  border-left: 4px solid #e54c17;
}

.tag {
  border-radius: 4px;
  padding-right: 5px;
  padding-left: 5px;
  background-color: #40454e;
  color: #eee;
}

.no-data {
  padding-top: 50px;
  width: 100%;
  text-align: center;
}
</style>
