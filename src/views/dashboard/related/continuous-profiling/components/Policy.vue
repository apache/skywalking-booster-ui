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
    <div class="label">{{ t("targetTypes") }}</div>
    <Selector
      class="profile-input"
      size="small"
      :value="states.targetType"
      :options="TargetTypes"
      placeholder="Select a type"
      @change="changeType"
    />
  </div>
  <div v-for="(item, index) in states.checkItems" :key="index">
    <div class="item-title">
      <span class="title">{{ `Item - ${index + 1}` }}</span>
      <Icon
        class="ml-5 cp"
        iconName="remove_circle_outline"
        size="middle"
        v-show="states.checkItems.length !== 1"
        @click="removeItem($event, index)"
      />
      <Icon
        class="ml-5 cp"
        v-show="index === states.checkItems.length - 1"
        iconName="add_circle_outlinecontrol_point"
        size="middle"
        @click="createItem"
      />
    </div>
    <div>
      <div class="label">{{ t("monitorType") }}</div>
      <Selector
        class="profile-input"
        size="small"
        :value="item.type"
        :options="MonitorType"
        placeholder="Select a type"
        @change="changeMonitorType($event, index)"
      />
    </div>
    <div>
      <div class="label">{{ t("count") }}</div>
      <el-input-number size="small" class="profile-input" :min="0" v-model="item.count" @change="changeParam" />
    </div>
    <div>
      <div class="label">{{ t("threshold") }}</div>
      <el-input size="small" class="profile-input" v-model="item.threshold" @change="changeParam" />
    </div>
    <div>
      <div class="label">{{ t("period") }}</div>
      <el-input-number size="small" class="profile-input" :min="0" v-model="item.period" @change="changeParam" />
    </div>
    <div v-show="TYPES.includes(item.type)">
      <div class="label">{{ t("uriRegex") }}</div>
      <el-input size="small" class="profile-input" v-model="item.uriRegex" @change="changeParam(index)" />
    </div>
    <div v-show="TYPES.includes(item.type)">
      <div class="label">{{ t("uriList") }}</div>
      <div id="uri-param" contenteditable="true" @input="changeURI($event, index)" class="profile-input">
        {{ (item.uriList || []).join("; ") }}
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { reactive } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import { ElMessage } from "element-plus";
  import type { StrategyItem, CheckItems } from "@/types/continous-profiling";
  import { MonitorType, TargetTypes } from "../data";

  /* global defineEmits, defineProps */
  const props = defineProps({
    policyList: {
      type: Object as PropType<StrategyItem[]>,
      default: () => ({}),
    },
    order: {
      type: Number,
      default: 0,
    },
  });
  const emits = defineEmits(["edit"]);
  const { t } = useI18n();
  const states = reactive<StrategyItem>(props.policyList[props.order]);
  const TYPES = ["HTTP_ERROR_RATE", "HTTP_AVG_RESPONSE_TIME"];

  function changeType(opt: { value: string }[]) {
    const types = props.policyList.map((item: StrategyItem) => item.targetType);
    if (types.includes(opt[0].value)) {
      return ElMessage.warning("Target type cannot be configured repeatedly.");
    }
    states.targetType = opt[0].value;
    emits("edit", states, props.order);
  }

  function changeMonitorType(opt: { value: string }[], index: number) {
    const types = states.checkItems.map((item: CheckItems) => item.type);
    if (types.includes(opt[0].value)) {
      return ElMessage.warning("Monitor type cannot be configured repeatedly.");
    }
    states.checkItems[index].type = opt[0].value;
    emits("edit", states, props.order);
  }

  function changeURI(event: any, index: number) {
    if (states.checkItems[index].uriRegex) {
      return ElMessage.warning("UriList or UriRegex only be configured with one option.");
    }
    const params = event.target.textContent;
    const regex = /http[^;]*;/g;
    const arr = params.match(regex);
    states.checkItems[index].uriList = arr.length ? arr : null;
    emits("edit", states, props.order);
  }

  function changeParam(index?: any) {
    if (index !== undefined && (states.checkItems[index] || {}).uriList) {
      return ElMessage.warning("UriList or UriRegex only be configured with one option");
    }
    const checkItems = states.checkItems.map((d: CheckItems) => {
      d.count = Number(d.count);
      d.period = Number(d.period);
      return d;
    });
    emits("edit", { ...states, checkItems }, props.order);
  }

  function createItem(e: PointerEvent) {
    e.stopPropagation();
    states.checkItems.push({
      type: "",
      threshold: "",
      period: NaN,
      count: NaN,
    });
    emits("edit", states, props.order);
  }

  function removeItem(e: PointerEvent, key: number) {
    e.stopPropagation();
    if (states.checkItems.length === 1) {
      return;
    }
    states.checkItems = states.checkItems.filter((_, index: number) => index !== key);
    emits("edit", states, props.order);
  }
</script>
<style lang="scss" scoped>
  .profile-input {
    width: 300px;
    margin-bottom: 10px;
  }

  #uri-param {
    border: 1px solid #dcdfe6;
    cursor: text;
    padding: 0 5px;
    border-radius: 4px;
    color: #606266;
    outline: none;
    height: 100px;

    &:focus {
      border-color: #409eff;
    }
  }

  .item-title {
    margin-bottom: 5px;
    font-size: 14px;
  }
</style>
