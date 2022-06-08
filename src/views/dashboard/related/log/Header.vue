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
  <div class="flex-h log-wrapper">
    <div v-if="currentSearchTerm === 'column'" class="flex-h items-center mr-5">
      <el-dropdown class="dark" :hide-on-click="false">
        <span class="cursor-pointer">
          Select visible columns<el-icon class="el-icon--right"
            ><arrow-down
          /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="dropdownSelector">
            <el-dropdown-item>
              <div
                style="width: 100%"
                class="flex-h items-center justify-between"
                @click="logStore.toggleAllColumns(true)"
              >
                <el-icon><View /></el-icon>
                <span style="margin-right: 10px">Show All</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div
                style="width: 100%"
                class="flex-h items-center justify-between"
                @click="logStore.toggleAllColumns(false)"
              >
                <el-icon><Hide /></el-icon>
                <span style="margin-right: 10px">Hide All</span>
              </div>
            </el-dropdown-item>
            <el-divider />
            <el-dropdown-item
              v-for="item in logStore.serviceLogColumn"
              :key="item.value"
            >
              <el-checkbox class="custom-checkbox" v-model="item.isVisible">
                <span>{{ item.value }}</span>
              </el-checkbox>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button class="toggle-btn mx-3danger" @click="setSearchTerm('')">
        <Icon iconSize="sm" iconName="cancel" />
      </el-button>
    </div>
    <div v-if="!currentSearchTerm.length" class="flex-h items-center">
      <div v-for="(item, index) in arrayOfFilters" :key="index">
        <el-tooltip
          class="box-item"
          effect="dark"
          :content="item.description"
          placement="bottom-start"
        >
          <el-button
            type="success"
            :class="[activeTerms.includes(item.name) ? 'active-toggle' : '']"
            class="toggle-btn mx-3"
            v-show="item.isVisible"
            @click="setSearchTerm(item.name)"
          >
            <Icon iconSize="sm" :iconName="item.iconName" />
          </el-button>
        </el-tooltip>
      </div>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="Toggle columns"
        placement="bottom-start"
      >
        <el-button
          type="success"
          :class="[false ? 'active-toggle' : '']"
          class="toggle-btn mx-3"
          @click="toggleColumSelector"
        >
          <Icon iconSize="sm" iconName="epic" />
        </el-button>
      </el-tooltip>
    </div>

    <div class="flex-h items-center">
      <div class="flex-h items-center" v-if="currentSearchTerm === 'service'">
        <div
          class="mr-5 flex-h items-center"
          v-if="dashboardStore.entity === EntityType[1].value"
        >
          <span class="grey mr-5">{{ t("service") }}:</span>
          <Selector
            size="small"
            :value="state.service.value"
            :options="logStore.services"
            placeholder="Select a service"
            @change="changeField('service', $event)"
          />
        </div>
        <b v-else>{{ t("service") }} data not available</b>
      </div>

      <div class="flex-h items-center" v-if="currentSearchTerm === 'instance'">
        <div
          class="mr-5 items-center flex-h"
          v-if="
            dashboardStore.entity !== EntityType[3].value &&
            currentSearchTerm === 'instance'
          "
        >
          <span class="grey mr-5">
            {{ isBrowser ? t("version") : t("instance") }}:
          </span>
          <Selector
            size="small"
            :value="state.instance.value"
            :options="logStore.instances"
            placeholder="Select a instance"
            @change="changeField('instance', $event)"
          />
        </div>
        <b v-else>{{ t("instance") }} data not available</b>
      </div>

      <div class="flex-h items-center" v-if="currentSearchTerm === 'endpoints'">
        <div
          class="mr-5 flex-h items-center"
          v-if="
            dashboardStore.entity !== EntityType[2].value &&
            currentSearchTerm === 'endpoints'
          "
        >
          <span class="grey mr-5"
            >{{ isBrowser ? t("page") : t("endpoint") }}:</span
          >
          <Selector
            size="small"
            :value="state.endpoint.value"
            :options="logStore.endpoints"
            placeholder="Select a endpoint"
            @change="changeField('endpoint', $event)"
            :isRemote="true"
            @query="searchEndpoints"
          />
        </div>
        <b v-else>{{ t("endpoint") }} data not available</b>
      </div>
    </div>
    <!-- <div class="row tips">
      <b>{{ t("conditionNotice") }}</b>
    </div> -->
    <div class="flex-h items-center">
      <div class="mr-5 flex-h items-center traceId" v-show="!isBrowser">
        <div class="flex-h items-center" v-if="currentSearchTerm === 'traceId'">
          <span class="grey mr-5">{{ t("traceID") }}:</span>
          <el-input v-model="traceId" class="inputs-max" size="small" />
        </div>
      </div>
      <keep-alive>
        <ConditionTags
          ref="logTagsComponent"
          v-if="currentSearchTerm === 'tags'"
          :type="'LOG'"
          @update="updateTags"
        />
      </keep-alive>
    </div>

    <div class="flex-h items-center" v-show="!isBrowser">
      <div
        class="mr-5 flex-h items-center"
        v-show="supportQueryLogsByKeywords && currentSearchTerm === 'keywords'"
      >
        <span class="mr-5 grey">{{ t("keywordsOfContent") }}:</span>
        <span class="log-tags">
          <span
            class="selected"
            v-for="(item, index) in keywordsOfContent"
            :key="`keywordsOfContent${index}`"
          >
            <span>{{ item }}</span>
            <span class="remove-icon" @click="removeContent(index)">×</span>
          </span>
        </span>
        <el-input
          size="small"
          class="inputs-max"
          :placeholder="t('addKeywordsOfContent')"
          v-model="contentStr"
          @change="addLabels('keywordsOfContent')"
        />
      </div>
      <div
        class="mr-5 flex-h items-center"
        v-show="
          supportExcludeQueryLogsByKeywords && currentSearchTerm === 'exclude'
        "
      >
        <span class="grey mr-5"> {{ t("excludingKeywordsOfContent") }}: </span>
        <span class="log-tags">
          <span
            class="selected"
            v-for="(item, index) in excludingKeywordsOfContent"
            :key="`excludingKeywordsOfContent${index}`"
          >
            <span>{{ item }}</span>
            <span class="remove-icon" @click="removeExcludeContent(index)">
              ×
            </span>
          </span>
        </span>
        <el-input
          class="inputs-max"
          size="small"
          :placeholder="t('addExcludingKeywordsOfContent')"
          v-model="excludingContentStr"
          @change="addLabels('excludingKeywordsOfContent')"
        />
        <el-tooltip :content="t('keywordsOfContentLogTips')">
          <span class="log-tips" v-show="!logStore.supportQueryLogsByKeywords">
            <Icon icon="help" class="mr-5" />
          </span>
        </el-tooltip>
      </div>

      <!-- Search&cancel buttons -->
      <div
        v-if="currentSearchTerm.length && currentSearchTerm !== 'column'"
        class="flex-h items-center"
      >
        <el-button
          class="search-btn toggle-btn"
          size="small"
          type="primary"
          @click="searchLogs"
        >
          <Icon iconSize="sm" iconName="search" />
        </el-button>
        <el-button
          class="search-btn toggle-btn"
          size="small"
          type="primary"
          @click="cancelSearchTerm"
        >
          <Icon iconSize="sm" iconName="cancel" />
        </el-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ArrowDown, View, Hide } from "@element-plus/icons-vue";
import { ref, reactive, watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { Option } from "@/types/app";
import { useLogStore } from "@/store/modules/log";
import { useDashboardStore } from "@/store/modules/dashboard";
import { useAppStoreWithOut } from "@/store/modules/app";
import { useSelectorStore } from "@/store/modules/selectors";
import ConditionTags from "@/views/components/ConditionTags.vue";
import { ElMessage } from "element-plus";
import { EntityType } from "../../data";

const { t } = useI18n();
const appStore = useAppStoreWithOut();
const selectorStore = useSelectorStore();
const dashboardStore = useDashboardStore();
const { portal } = useRoute().query;
const logStore = useLogStore();
const showColumList = ref<boolean>(false);
const traceId = ref<string>("");
const keywordsOfContent = ref<string[]>([]);
const excludingKeywordsOfContent = ref<string[]>([]);
const supportQueryLogsByKeywords = computed<boolean>(() => {
  return logStore.supportQueryLogsByKeywords;
});
const supportExcludeQueryLogsByKeywords = computed<boolean>(() => {
  return logStore.supportQueryLogsByKeywords;
});

const currentSearchTerm = ref<string>("");
const activeTerms = ref<string[]>([]);
const tagsList = ref<string[]>([]);
const tagsMap = ref<Option[]>([]);
const contentStr = ref<string>("");
const excludingContentStr = ref<string>("");
const isBrowser = ref<boolean>(dashboardStore.layerId === "BROWSER");
const state = reactive<any>({
  instance: { value: "0", label: "All" },
  endpoint: { value: "0", label: "All" },
  service: { value: "", label: "" },
});
const logTagsComponent = ref<InstanceType<typeof ConditionTags> | null>(null);
interface filtersObject {
  name: string;
  iconName: string;
  description: string;
  isVisible?: boolean | unknown; // one of the situations is dependent on an api call
}
const arrayOfFilters = ref<filtersObject[]>([
  {
    name: "traceId",
    iconName: "timeline",
    description: "Trace ID",
    isVisible: true,
  },
  {
    name: "tags",
    iconName: "epic",
    description: "Tags",
    isVisible: true,
  },
  {
    name: "keywords",
    iconName: "library_books",
    description: "Keywords",
    isVisible: supportQueryLogsByKeywords,
  },
  {
    name: "exclude",
    iconName: "issue-child",
    description: "Exclude keywords",
    isVisible: supportExcludeQueryLogsByKeywords,
  },
  {
    name: "instance",
    iconName: "epic",
    description: "Instance",
    isVisible: dashboardStore.entity !== EntityType[3].value,
  },
  {
    name: "service",
    iconName: "settings",
    description: "Service",
    isVisible: dashboardStore.entity === EntityType[1].value,
  },
  {
    name: "endpoints",
    iconName: "timeline",
    description: "Endpoints",
    isVisible: dashboardStore.entity !== EntityType[2].value,
  },
]);
onMounted(() => {
  if (portal) {
    ["endpoint", "time", "contentType", "tags", "traceID"].forEach((col) =>
      logStore.hideColumns(col)
    );
  }
});
init();
function toggleColumSelector() {
  showColumList.value = !showColumList.value;
  setSearchTerm("column");
}

function hideTags() {
  let tagsWrap = document.querySelector(".el-select__tags");
  if (!tagsWrap) return;
  tagsWrap.style.display = "none";
}
async function init() {
  const resp = await logStore.getLogsByKeywords();

  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  await fetchSelectors();
  await searchLogs();
  state.instance = { value: "0", label: "All" };
  state.endpoint = { value: "0", label: "All" };
}

function fetchSelectors() {
  if (dashboardStore.entity === EntityType[1].value) {
    getServices();
    return;
  }
  if (dashboardStore.entity === EntityType[2].value) {
    getInstances();
    return;
  }
  if (dashboardStore.entity === EntityType[3].value) {
    getEndpoints();
    return;
  }
  if (dashboardStore.entity === EntityType[0].value) {
    getInstances();
    getEndpoints();
  }
}

async function getServices() {
  const resp = await logStore.getServices(dashboardStore.layerId);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.service = logStore.services[0];
  getInstances(state.service.id);
  getEndpoints(state.service.id);
}

async function getEndpoints(id?: string) {
  const resp = await logStore.getEndpoints(id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.endpoint = logStore.endpoints[0];
}
async function getInstances(id?: string) {
  const resp = await logStore.getInstances(id);
  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  state.instance = logStore.instances[0];
}
function addToActiveTerms() {
  activeTerms.value.push(currentSearchTerm.value);
}
function removeFromActiveTerms() {
  activeTerms.value = activeTerms.value.filter(
    (term) => term !== currentSearchTerm.value
  );
}
function handleActiveSearchTerms() {
  switch (currentSearchTerm.value) {
    case "traceId":
      if (!traceId.value.length) return;
      addToActiveTerms();
      break;
    case "tags":
      if (!tagsList.value.length) return;
      addToActiveTerms();
      break;
    case "keywords":
      if (!keywordsOfContent.value.length) return;
      addToActiveTerms();
      break;
    case "exclude":
      if (!excludingKeywordsOfContent.value.length) return;
      addToActiveTerms();
      break;
    case "instance":
      addToActiveTerms();
      break;
    case "service":
      addToActiveTerms();
      break;
    case "endpoints":
      addToActiveTerms();
      break;
  }
}
function searchLogs() {
  handleActiveSearchTerms();
  currentSearchTerm.value = "";
  let endpoint = "",
    instance = "";
  if (dashboardStore.entity === EntityType[2].value) {
    endpoint = selectorStore.currentPod.id;
  }
  if (dashboardStore.entity === EntityType[3].value) {
    instance = selectorStore.currentPod.id;
  }
  logStore.setLogCondition({
    serviceId: selectorStore.currentService
      ? selectorStore.currentService.id
      : state.service.id,
    endpointId: endpoint || state.endpoint.id || undefined,
    serviceInstanceId: instance || state.instance.id || undefined,
    queryDuration: appStore.durationTime,
    keywordsOfContent: keywordsOfContent.value,
    excludingKeywordsOfContent: excludingKeywordsOfContent.value,
    tags: tagsMap.value.length ? tagsMap.value : undefined,
    paging: { pageNum: 1, pageSize: 15, needTotal: true },
    relatedTrace: traceId.value ? { traceId: traceId.value } : undefined,
  });
  queryLogs();
}
async function queryLogs() {
  const res = await logStore.getLogs();
  if (res && res.errors) {
    ElMessage.error(res.errors);
  }
}
function changeField(type: string, opt: any) {
  state[type] = opt[0];
  if (type === "service") {
    getEndpoints(state.service.id);
    getInstances(state.service.id);
  }
}
async function searchEndpoints(keyword: string) {
  const resp = await logStore.getEndpoints(state.service.id, keyword);
  if (resp.errors) {
    ElMessage.error(resp.errors);
  }
}
function updateTags(data: { tagsMap: Array<Option>; tagsList: string[] }) {
  tagsList.value = data.tagsList;
  tagsMap.value = data.tagsMap;
}
function removeContent(index: number) {
  const keywordsOfContentList = keywordsOfContent.value || [];
  keywordsOfContentList.splice(index, 1);
  logStore.setLogCondition({
    keywordsOfContent: keywordsOfContentList,
  });
  contentStr.value = "";
}
function addLabels(type: string) {
  if (type === "keywordsOfContent" && !contentStr.value) {
    return;
  }
  if (type === "excludingKeywordsOfContent" && !excludingContentStr.value) {
    return;
  }
  if (type === "keywordsOfContent") {
    keywordsOfContent.value.push(contentStr.value);
    logStore.setLogCondition({
      [type]: keywordsOfContent.value,
    });
    contentStr.value = "";
  } else if (type === "excludingKeywordsOfContent") {
    excludingKeywordsOfContent.value.push(excludingContentStr.value);
    logStore.setLogCondition({
      [type]: excludingKeywordsOfContent.value,
    });
    excludingContentStr.value = "";
  }
}
function removeExcludeContent(index: number) {
  excludingKeywordsOfContent.value.splice(index, 1);
  logStore.setLogCondition({
    excludingKeywordsOfContent: excludingKeywordsOfContent.value,
  });
  excludingContentStr.value = "";
}
function setSearchTerm(term: string) {
  currentSearchTerm.value = term;
  if (term === "column") {
    setTimeout(() => {
      hideTags();
    }, 200);
  }
}
function cancelSearchTerm() {
  switch (currentSearchTerm.value) {
    case "traceId":
      traceId.value = "";
      break;
    case "tags":
      tagsList.value = [];
      tagsMap.value = [];
      logTagsComponent.value?.emptyTags();
      break;
    case "keywords":
      keywordsOfContent.value = [];
      break;
    case "exclude":
      excludingKeywordsOfContent.value = [];
      break;
    case "instance":
      state.instance = { value: "0", label: "All" };
      break;
    case "endpoints":
      state.endpoint = { value: "0", label: "All" };
      getEndpoints();
      break;
    case "service":
      state.service = { value: "", label: "" };
      break;
  }
  removeFromActiveTerms();
  currentSearchTerm.value = "";
  searchLogs();
}
watch(
  () => selectorStore.currentService,
  () => {
    if (dashboardStore.entity === EntityType[0].value) {
      init();
    }
  }
);
watch(
  () => [selectorStore.currentPod],
  () => {
    if (dashboardStore.entity === EntityType[0].value) {
      return;
    }
    init();
  }
);
watch(
  () => appStore.durationTime,
  () => {
    if (dashboardStore.entity === EntityType[1].value) {
      init();
    }
  }
);
</script>
<style lang="scss" scoped>
.dropdownSelector {
  background: var(--nice-black);
}
.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
}
.el-divider--horizontal{
  margin: 10px 0 0 0 !important;
}
.cursor-pointer {
  cursor: pointer;
}

.custom-checkbox .el-checkbox__input.is-checked + .el-checkbox__label,
.custom-checkbox .el-checkbox__label {
  color: var(--spp-white) !important;
}
// .log-wrapper {
//   width: 600px;
//   padding-left: 40px;
//   overflow-x: scroll;
//   align-items: center;
// }
.inputs {
  width: 120px;
}
.items-center {
  align-items: center;
}
.justify-between {
  justify-content: space-between;
}
.row {
  margin-bottom: 5px;
}

.inputs-max {
  width: 270px;
}

.traceId {
  margin-top: 2px;
}

.search-btn {
  margin-left: 20px;
  cursor: pointer;
}

.tips {
  color: #888;
}

.log-tag {
  width: 30%;
  border-style: unset;
  outline: 0;
  border: 1px solid #ccc;
  height: 30px;
  padding: 0 5px;
}

.log-tags {
  padding: 1px 5px 0 0;
  border-radius: 3px;
  height: 24px;
  display: inline-block;
  vertical-align: top;
}

.selected {
  display: inline-block;
  padding: 0 3px;
  border-radius: 3px;
  overflow: hidden;
  color: #3d444f;
  border: 1px dashed #aaa;
  font-size: 12px;
  margin: 0 2px;
}

.remove-icon {
  display: inline-block;
  margin-left: 3px;
  cursor: pointer;
}

/* buttons*/
.el-button span {
  font-size: 10px !important;
}
.toggle-btn {
  height: 18px;
  margin: 0 5px;
}
.active-toggle.toggle-btn {
  background: rgba(4, 147, 114, 1) !important;
  span {
    color: #275410 !important;
  }
}
.items-center {
  align-items: center;
}
.space-between {
  justify-content: space-between !important;
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected {
  background: transparent;
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected {
  width: 100%;
  padding: 0 32px 0 20px;
}
.el-select-dropdown__item.selected {
  display: block;
  width: 100%;
  padding: 0 32px 0 20px;
}
.el-select-dropdown.is-multiple .el-select-dropdown__item.selected::after {
  display: none;
}
</style>
