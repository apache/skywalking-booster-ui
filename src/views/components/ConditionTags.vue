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
  <div class="flex-h" :class="{ light: theme === 'light' }">
    <div class="mr-10 pt-5">
      <span class="sm grey" v-show="theme === 'dark'">{{ t("tags") }}: </span>
      <span
        class="trace-tags"
        :style="type === 'LOG' ? `min-width: 122px;` : ''"
      >
        <span class="selected" v-for="(item, index) in tagsList" :key="index">
          <span>{{ item }}</span>
          <span class="remove-icon" @click="removeTags(index)">×</span>
        </span>
      </span>
      <el-input v-model="tags" class="trace-new-tag" @change="addLabels" />
      <span class="tags-tip">
        <a
          target="blank"
          href="https://github.com/apache/skywalking/blob/master/docs/en/setup/backend/configuration-vocabulary.md"
        >
          {{ t("tagsLink") }}
        </a>
        <Icon iconName="help" class="mr-5" />
        <b>{{ t("noticeTag") }}</b>
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

/*global defineEmits, defineProps */
const emit = defineEmits(["update"]);
defineProps({
  type: { type: String, default: "TRACE" },
});
const { t } = useI18n();
const theme = ref<string>("dark");
const type = ref<string>("");
const tags = ref<string>("");
const tagsList = ref<string[]>([]);

function removeTags(index: number) {
  tagsList.value.splice(index, 1);
  updateTags();
  localStorage.setItem("traceTags", JSON.stringify(this.tagsList));
}
function addLabels(event: KeyboardEvent) {
  if (event.keyCode !== 13 || !this.tags) {
    return;
  }
  tagsList.value.push(tags.value);
  tags.value = "";
  updateTags();
}
function updateTags() {
  const tagsMap = tagsList.value.map((item: string) => {
    const label = item.substring(0, item.indexOf("="));
    return {
      label,
      value: item.substring(item.indexOf("=") + 1, item.length),
    };
  });
  emit("update", { tagsMap, tagsList: tagsList.value });
}
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
  color: #eee;
  font-size: 12px;
  margin: 0 2px;
}

.trace-new-tag {
  border-style: unset;
  outline: 0;
  padding: 2px 5px;
  border-radius: 3px;
  width: 250px;
  margin-right: 3px;
}

.remove-icon {
  display: inline-block;
  margin-left: 3px;
  cursor: pointer;
}

.tags-tip {
  color: #a7aebb;
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
</style>
