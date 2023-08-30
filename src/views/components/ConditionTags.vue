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
    <span v-if="tagsList.length" class="trace-tags">
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
    <el-popover v-else trigger="click" :visible="visible" width="300px">
      <template #reference>
        <el-input
          size="small"
          v-model="tags"
          class="trace-new-tag"
          @input="inputTags"
          @blur="visible = false"
          @focus="visible = true"
          @change="addTags"
        />
      </template>
      <div class="content">
        <span v-for="(item, index) in tagList" :key="index" @click="selectTag(item)" class="tag-item">
          {{ item }}
        </span>
      </div>
    </el-popover>
    <span class="tags-tip" :class="type !== 'ALARM' && tagArr.length ? 'link-tips' : ''">
      <a
        target="blank"
        href="https://github.com/apache/skywalking/blob/master/docs/en/setup/backend/configuration-vocabulary.md"
      >
        {{ t("tagsLink") }}
      </a>
      <el-tooltip :content="t((tipsMap as any)[type])">
        <span>
          <Icon class="icon-help mr-5" iconName="help" size="middle" />
        </span>
      </el-tooltip>
      <b v-if="type === 'ALARM'">{{ t("noticeTag") }}</b>
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

  /*global defineEmits, defineProps, Recordable */
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
  const tagList = ref<string[]>([]);
  const tagKeys = ref<string[]>([]);
  const keysList = ref<string[]>([]);
  const visible = ref<boolean>(false);
  const tipsMap = {
    LOG: "logTagsTip",
    TRACE: "traceTagsTip",
    ALARM: "alarmTagsTip",
  };

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
    let resp: Recordable = {};
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
    keysList.value = resp.data.tagKeys;
    searchTags();
  }

  async function fetchTagValues() {
    const param = tags.value.split("=")[0];
    let resp: Recordable = {};
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
    searchTags();
  }

  function inputTags() {
    if (!tags.value) {
      tagArr.value = keysList.value;
      tagKeys.value = keysList.value;
      tagList.value = tagArr.value;
      return;
    }
    let search = "";
    if (tags.value.includes("=")) {
      search = tags.value.split("=")[1];
      fetchTagValues();
    } else {
      search = tags.value;
    }
    tagList.value = tagArr.value.filter((d: string) => d.includes(search));
  }

  function addTags() {
    if (!tags.value.includes("=")) {
      return;
    }
    addLabels();
    tagArr.value = tagKeys.value;
    searchTags();
  }

  function selectTag(item: string) {
    if (tags.value.includes("=")) {
      const key = tags.value.split("=")[0];
      tags.value = key + "=" + item;
      addTags();
      return;
    }
    tags.value = item + "=";
    fetchTagValues();
  }

  function searchTags() {
    let search = "";
    if (tags.value.includes("=")) {
      search = tags.value.split("=")[1];
    } else {
      search = tags.value;
    }
    tagList.value = tagArr.value.filter((d: string) => d.includes(search));
  }

  watch(
    () => appStore.durationTime,
    () => {
      fetchTagKeys();
    },
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
    font-size: $font-size-smaller;
    margin: 3px 2px 0;
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
    cursor: pointer;
    margin-top: 10px;

    &:hover {
      color: $active-color;
    }
  }

  .tags-tip {
    color: #a7aebb;
  }

  .link-tips {
    display: inline-block;
  }

  .light {
    color: $font-color;

    input {
      border: 1px solid $disabled-color;
    }

    .selected {
      color: $font-color;
    }
  }

  .icon-help {
    cursor: pointer;
  }

  .content {
    width: 300px;
    max-height: 400px;
    overflow: auto;
  }
</style>
