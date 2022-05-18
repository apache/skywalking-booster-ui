<template>
  <div class="trace-detail-wrapper flex-h" v-if="traceStore.currentTrace.endpointNames">
    <div class="mb-0 mt-0">
      <Icon icon="clear" v-if="traceStore.currentTrace.isError" class="red mr-5 sm" />
      <div class="trace-log-btn">
        <el-tooltip
          class="box-item"
          effect="dark"
          content="Back"
          placement="bottom-start"
        >
          <el-button
            size="small"
            class="mr-10 filter-btn"
            type="primary"
            @click="showTraceList"
          >
            <Icon iconSize="sm" iconName="chevron-left" />
          </el-button>
        </el-tooltip>

        <el-tooltip
          class="box-item"
          effect="dark"
          :content="t('viewLogs')"
          placement="bottom-start"
        >
          <el-button
            size="small"
            class="mr-10 filter-btn"
            type="primary"
            @click="searchTraceLogs"
          >
            <Icon iconSize="sm" iconName="folder_open" />
          </el-button>
        </el-tooltip>
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
    </div>
    <div class="mb- blue sm">
      <span class="vm">{{ traceStore.currentTrace.endpointNames[0] }}</span>
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
      <el-tooltip
        class="box-item"
        effect="dark"
        content="Copy Id"
        placement="bottom-start"
      >
        <el-button
          size="small"
          class="mr-10 filter-btn"
          type="primary"
          @click="handleClick(traceStore.currentTrace.traceIds)"
        >
          <Icon iconSize="sm" iconName="review-list" />
        </el-button>
      </el-tooltip>
      <!-- <Icon
        size="sm"
        class="icon grey link-hover cp ml-5"
        iconName="review-list"
        @click="handleClick"
      /> -->
    </div>
    <div class="flex-h item">
      <div>
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="t('list')"
          placement="bottom-start"
        >
          <el-button
            class="filter-btn"
            size="small"
            :class="{ ghost: displayMode === 'List' }"
            @click="changeDisplayMode('List')"
          >
            <Icon class="mr-5" size="sm" iconName="list-bulleted" />
          </el-button>
        </el-tooltip>

        <el-tooltip
          class="box-item"
          effect="dark"
          :content="t('tree')"
          placement="bottom-start"
        >
          <el-button
            class="filter-btn"
            size="small"
            :class="{ ghost: displayMode === 'Tree' }"
            @click="changeDisplayMode('Tree')"
          >
            <Icon class="mr-5" size="sm" iconName="issue-child" />
          </el-button>
        </el-tooltip>

        <el-tooltip
          class="box-item"
          effect="dark"
          :content="t('table')"
          placement="bottom-start"
        >
          <el-button
            class="filter-btn"
            size="small"
            :class="{ ghost: displayMode === 'Table' }"
            @click="changeDisplayMode('Table')"
          >
            <Icon class="mr-5" size="sm" iconName="table" />
          </el-button>
        </el-tooltip>
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="t('statistics')"
          placement="bottom-start"
        >
          <el-button
            class="filter-btn"
            size="small"
            :class="{ ghost: displayMode === 'Statistics' }"
            @click="changeDisplayMode('Statistics')"
          >
            <Icon class="mr-5" size="sm" iconName="statistics-bulleted" />
          </el-button>
        </el-tooltip>
      </div>
    </div>
  </div>
  <div class="no-data" v-else>t("noData")</div>
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
      traceStore.setCurrentView("traceList");
    }
    function handleClick(ids: string[] | any) {
      let copyValue = null;
      if (ids.length === 1) {
        copyValue = ids[0].value;
      } else {
        copyValue = ids.map((trace: any) => trace.value).join(",");
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
.trace-chart.full-view {
  height: calc(100% - 1px) !important;
}

.trace-detail-wrapper {
  font-size: 12px;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  .grey {
    color: #fff;
    background-color: #448dfe;
  }

  .ghost {
    cursor: pointer;
    background: rgba(4, 147, 114, 1);
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
.vm {
  margin-right: 4px;
}
.filter-btn {
  height: 18px;
  margin: 0 5px;
}
</style>
