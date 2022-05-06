<template>
  <div
    class="trace-detail-wrapper clear"
    v-if="traceStore.currentTrace.endpointNames"
  >
    <h5 class="mb-5 mt-0">
      <Icon
        icon="clear"
        v-if="traceStore.currentTrace.isError"
        class="red mr-5 sm"
      />
      <span class="vm">{{ traceStore.currentTrace.endpointNames[0] }}</span>
      <div class="trace-log-btn">
        <el-button
          size="small"
          class="mr-10"
          type="primary"
          @click="showTraceList"
        >
          {{ t("back") }}
        </el-button>
        <el-button
          size="small"
          class="mr-10"
          type="primary"
          @click="searchTraceLogs"
        >
          {{ t("viewLogs") }}
        </el-button>
      </div>
      <el-dialog
        v-model="showTraceLogs"
        :destroy-on-close="true"
        fullscreen
        @closed="showTraceLogs = false"
      >
        <div>
          <el-pagination
            v-model:currentPage="pageNum"
            v-model:page-size="pageSize"
            :small="true"
            :total="traceStore.traceSpanLogsTotal"
            @current-change="turnLogsPage"
          />
          <LogTable
            :tableData="traceStore.traceSpanLogs || []"
            :type="`service`"
            :noLink="true"
          >
            <div class="log-tips" v-if="!traceStore.traceSpanLogs.length">
              {{ t("noData") }}
            </div>
          </LogTable>
        </div>
      </el-dialog>
    </h5>
    <div class="mb-5 blue sm">
      <Selector
        size="small"
        :value="
          traceStore.currentTrace.traceIds &&
          traceStore.currentTrace.traceIds[0] &&
          traceStore.currentTrace.traceIds[0].value
        "
        :options="traceStore.currentTrace.traceIds"
        @change="changeTraceId"
        class="trace-detail-ids"
      />
      <Icon
        size="sm"
        class="icon grey link-hover cp ml-5"
        iconName="review-list"
        @click="handleClick"
      />
    </div>
    <div class="flex-h item">
      <div>
        <div class="tag mr-5">{{ t("start") }}</div>
        <span class="mr-15 sm">
          {{ dateFormat(parseInt(traceStore.currentTrace.start)) }}
        </span>
        <div class="tag mr-5">{{ t("duration") }}</div>
        <span class="mr-15 sm">{{ traceStore.currentTrace.duration }} ms</span>
        <div class="tag mr-5">{{ t("spans") }}</div>
        <span class="sm">{{ traceStore.traceSpans.length }}</span>
      </div>
      <div>
        <el-button
          class="grey"
          size="small"
          :class="{ ghost: displayMode !== 'List' }"
          @click="changeDisplayMode('List')"
        >
          <Icon class="mr-5" size="sm" iconName="list-bulleted" />
          {{ t("list") }}
        </el-button>
        <el-button
          class="grey"
          size="small"
          :class="{ ghost: displayMode !== 'Tree' }"
          @click="changeDisplayMode('Tree')"
        >
          <Icon class="mr-5" size="sm" iconName="issue-child" />
          {{ t("tree") }}
        </el-button>
        <el-button
          class="grey"
          size="small"
          :class="{ ghost: displayMode !== 'Table' }"
          @click="changeDisplayMode('Table')"
        >
          <Icon class="mr-5" size="sm" iconName="table" />
          {{ t("table") }}
        </el-button>
        <el-button
          class="grey"
          size="small"
          :class="{ ghost: displayMode !== 'Statistics' }"
          @click="changeDisplayMode('Statistics')"
        >
          <Icon class="mr-5" size="sm" iconName="statistics-bulleted" />
          {{ t("statistics") }}
        </el-button>
      </div>
    </div>
  </div>
  <div class="no-data" v-else>{{ t("noData") }}</div>
</template>

<script lang="ts">
import dayjs from "dayjs";
import { ref, computed, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useTraceStore } from "@/store/modules/trace";
import { Option } from "@/types/app";
import copy from "@/utils/copy";
import LogTable from "@/views/dashboard/related/components/LogTable/Index.vue";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "TraceDetailsTools",
  components: {
    LogTable,
  },
  setup(props, ctx) {
    const { t } = useI18n();
    const traceStore = useTraceStore();
    const loading = ref<boolean>(false);
    const traceId = ref<string>("");
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
    function changeDisplayMode(mode: string) {
      traceStore.displayMode = mode;
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
      showTraceList,
      changeDisplayMode,
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
