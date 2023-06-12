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
  <div class="policy-list">
    <el-collapse v-model="activeNames">
      <el-collapse-item v-for="(_, index) in policyList" :key="index" :name="String(index)">
        <template #title>
          <div>
            <span class="title">{{ `Policy - ${index + 1}` }}</span>
            <Icon
              class="mr-5 cp"
              iconName="remove_circle_outline"
              size="middle"
              v-show="policyList.length !== 1"
              @click="removePolicy($event, index)"
            />
            <Icon
              class="cp"
              v-show="index === policyList.length - 1"
              iconName="add_circle_outlinecontrol_point"
              size="middle"
              @click="createPolicy"
            />
          </div>
        </template>
        <Policy :policyList="policyList" @edit="changePolicy" :order="index" />
      </el-collapse-item>
    </el-collapse>
    <div>
      <el-button @click="save" type="primary" class="save-btn">
        {{ t("save") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import type { PropType } from "vue";
  import { useI18n } from "vue-i18n";
  import Policy from "./Policy.vue";
  import type { StrategyItem, CheckItems } from "@/types/continous-profiling";

  /* global defineEmits, defineProps */
  const props = defineProps({
    policyList: {
      type: Array as PropType<StrategyItem[]>,
      default: () => [],
    },
  });
  const emits = defineEmits(["save"]);
  const { t } = useI18n();
  const activeNames = ref(["0"]);
  const policyList = ref<StrategyItem[]>([...props.policyList]);

  function changePolicy(params: StrategyItem, order: number) {
    policyList.value = policyList.value.map((d: StrategyItem, index: number) => {
      if (order === index) {
        return params;
      }
      return d;
    });
  }

  function removePolicy(e: PointerEvent, key: number) {
    e.stopPropagation();
    if (policyList.value.length === 1) {
      return;
    }
    policyList.value = policyList.value.filter((_, index: number) => index !== key);
  }

  function createPolicy(e: PointerEvent) {
    e.stopPropagation();
    policyList.value.push({
      type: "",
      checkItems: [
        {
          type: "",
          threshold: "",
          period: NaN,
          count: NaN,
        },
      ],
    });
    activeNames.value = [String(policyList.value.length - 1)];
  }

  function save() {
    const params = [];
    for (const d of policyList.value) {
      const checkItems = d.checkItems.filter(
        (item: CheckItems) => item.type && item.threshold && item.period && item.count,
      );
      if (d.type && checkItems.length) {
        const v = {
          targetType: d.type,
          checkItems,
        };
        params.push(v);
      }
    }

    emits("save", params);
  }
</script>
<style lang="scss" scoped>
  .policy-list {
    margin: 0 auto;
    width: 300px;
  }

  .save-btn {
    width: 300px;
    margin-top: 10px;
  }

  .title {
    display: inline-block;
    margin-right: 5px;
  }
</style>
