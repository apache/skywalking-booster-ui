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
    <span class="grey">{{ t("tags") }}: </span>
    <span
      v-if="tagsList.length"
      class="trace-tags"
      :style="type === 'LOG' ? `min-width: 122px;` : ''"
    >
      <span class="selected" v-for="(item, index) in tagsList" :key="index">
        <span>{{ item }}</span>
        <span class="remove-icon" @click="removeTags(index)">×</span>
      </span>
    </span>
    <el-input
      v-if="type === 'ALARM'"
      size="small"
      v-model="tags"
      class="trace-new-tag"
      @change="addLabels"
      :placeholder="t('addTags')"
    />
    <span v-else>
      <el-input
        size="small"
        v-model="tags"
        class="trace-new-tag"
        @click="showClick"
      />
      <el-dropdown
        ref="dropdownTag"
        trigger="contextmenu"
        :hide-on-click="false"
        style="margin: 20px 0 0 -130px"
        v-if="tagArr.length"
      >
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-for="(item, index) in tagArr" :key="index">
              <span @click="selectTag(item)" class="tag-item">
                {{ item }}
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </span>
    <span
      class="tags-tip"
      :class="type !== 'ALARM' && tagArr.length ? 'link-tips' : ''"
    >
      <a
        target="blank"
        href="https://github.com/apache/skywalking/blob/master/docs/en/setup/backend/configuration-vocabulary.md"
      >
        {{ t("tagsLink") }}
      </a>
      <el-tooltip :content="t(tipsMap[type])">
        <span>
          <Icon class="icon-help mr-5" iconName="help" size="middle" />
        </span>
      </el-tooltip>
      <b v-if="type === 'AL'">{{ t("noticeTag") }}</b>
    </span>
  </div>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useTraceStore } from "@/store/modules/trace";
import { useLogStore } from "@/store/modules/log";
import { ElMessage } from "element-plus";
import { useAppStoreWithOut } from "@/store/modules/app";

/*global Nullable, defineEmits, defineProps */
const emit = defineEmits(["update"]);
const props = defineProps({
  type: { type: String, default: "TRACE" },
});
const traceStore = useTraceStore();
const logStore = useLogStore();
const appStore = useAppStoreWithOut();
const { t } = useI18n();
const tags = ref<string>("");
const tagsList = ref<string[]>([]);
const tagArr = ref<string[]>([]);
const tagKeys = ref<string[]>([]);
const tipsMap = {
  LOG: "logTagsTip",
  TRACE: "traceTagsTip",
  ALARM: "alarmTagsTip",
};
const dropdownTag = ref<Nullable<any>>(null);

fetchTagKeys();

function removeTags(index: number) {
  tagsList.value.splice(index, 1);
  updateTags();
}
function addLabels() {
  if (!tags.value) {
    return;
  }
  tagsList.value.push(tags.value);
  tags.value = "";
  updateTags();
}
function updateTags() {
  const tagsMap = tagsList.value.map((item: string) => {
    const key = item.substring(0, item.indexOf("="));
    return {
      key,
      value: item.substring(item.indexOf("=") + 1, item.length),
    };
  });
  emit("update", { tagsMap, tagsList: tagsList.value });
}
async function fetchTagKeys() {
  let resp: any = {};
  if (props.type === "TRACE") {
    resp = await traceStore.getTagKeys();
  } else {
    resp = await logStore.getLogTagKeys();
  }

  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  tagArr.value = resp.data.tagKeys;
  tagKeys.value = resp.data.tagKeys;
}

async function fetchTagValues() {
  const param = tags.value.split("=")[0];
  let resp: any = {};
  if (props.type === "TRACE") {
    resp = await traceStore.getTagValues(param);
  } else {
    resp = await logStore.getLogTagValues(param);
  }

  if (resp.errors) {
    ElMessage.error(resp.errors);
    return;
  }
  tagArr.value = resp.data.tagValues;
}

function selectTag(item: string) {
  if (tags.value.includes("=")) {
    tags.value += item;
    addLabels();
    tagArr.value = tagKeys.value;
    dropdownTag.value.handleClose();
    return;
  }
  tags.value = item + "=";
  fetchTagValues();
}

function showClick() {
  if (dropdownTag.value) {
    dropdownTag.value.handleOpen();
  }
}
watch(
  () => appStore.durationTime,
  () => {
    fetchTagKeys();
  }
);
</script>
<style lang="scss" scoped>
.trace-tags {
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
  border: 1px dashed #aaa;
  font-size: 12px;
  margin: 3px 2px 0 2px;
}

.trace-new-tag {
  border-style: unset;
  outline: 0;
  padding: 2px 5px;
  border-radius: 3px;
  width: 250px;
}

.remove-icon {
  display: inline-block;
  margin-left: 3px;
  cursor: pointer;
}

.tag-item {
  display: inline-block;
  min-width: 210px;
}

.tags-tip {
  color: #a7aebb;
}

.link-tips {
  display: inline-block;
  margin-left: 130px;
}

.light {
  color: #3d444f;

  input {
    border: 1px solid #ccc;
  }

  .selected {
    color: #3d444f;
  }
}

.icon-help {
  cursor: pointer;
}
</style>
