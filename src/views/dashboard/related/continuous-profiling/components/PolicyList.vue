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
  <div class="profile-task-list flex-v" v-loading="continousProfilingStore.policyLoading">
    <div class="profile-task-wrapper flex-v">
      <div class="profile-t-tool">
        <span>{{ t("policyList") }}</span>
        <span class="new-task cp" @click="setStrategies">
          <Icon iconName="edit" size="middle" />
        </span>
      </div>
      <div class="profile-t-wrapper">
        <div class="no-data" v-show="!continousProfilingStore.strategyList.length">
          {{ t("noData") }}
        </div>
        <table class="profile-t">
          <tr
            class="profile-tr cp"
            v-for="(i, index) in continousProfilingStore.strategyList"
            @click="changePolicy(i)"
            :key="index"
          >
            <td
              class="profile-td"
              :class="{
                selected: continousProfilingStore.selectedStrategy.id === i.id,
              }"
              v-if="i.type"
            >
              <div class="ell">
                <span class="sm">
                  {{ i.type }}
                </span>
              </div>
              <div class="grey ell sm" v-for="(item, index) in i.checkItems" :key="index">
                <span class="sm">
                  {{
                    `${item.type} >= ${item.threshold}${
                      [MonitorType[0].value, MonitorType[3].value].includes(item.type) ? "%" : ""
                    }; `
                  }}
                </span>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
  <el-dialog
    v-model="updateStrategies"
    :title="t('editStrategy')"
    :destroy-on-close="true"
    fullscreen
    @closed="updateStrategies = false"
  >
    <EditPolicy :policyList="continousProfilingStore.strategyList" @save="editStrategies" />
  </el-dialog>
</template>
<script lang="ts" setup>
  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useContinousProfilingStore } from "@/store/modules/continous-profiling";
  import { useSelectorStore } from "@/store/modules/selectors";
  import type { StrategyItem, CheckItems } from "@/types/continous-profiling";
  import { ElMessage } from "element-plus";
  import EditPolicy from "./EditPolicy.vue";
  import { MonitorType } from "../data";

  const { t } = useI18n();
  const selectorStore = useSelectorStore();
  const continousProfilingStore = useContinousProfilingStore();
  const updateStrategies = ref<boolean>(false);
  const inProcess = ref<boolean>(false);

  fetchStrategyList();

  async function changePolicy(item: StrategyItem) {
    continousProfilingStore.setSelectedStrategy(item);
    const serviceId = (selectorStore.currentService && selectorStore.currentService.id) || "";
    await continousProfilingStore.getMonitoringInstances(serviceId);
  }

  function setStrategies() {
    updateStrategies.value = true;
  }

  async function editStrategies(
    targets: {
      targetType: string;
      checkItems: CheckItems[];
    }[],
  ) {
    const serviceId = (selectorStore.currentService && selectorStore.currentService.id) || "";
    if (!serviceId) {
      return ElMessage.error("No Service ID");
    }
    const res = await continousProfilingStore.setContinuousProfilingPolicy(serviceId, targets);
    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    if (!res.data.strategy.status) {
      ElMessage.error(res.data.strategy.errorReason);
      return;
    }
    updateStrategies.value = false;
    await fetchStrategyList();
  }

  async function fetchStrategyList() {
    const serviceId = (selectorStore.currentService && selectorStore.currentService.id) || "";
    const res = await continousProfilingStore.getStrategyList({
      serviceId,
    });

    if (res.errors) {
      return ElMessage.error(res.errors);
    }
    if (!continousProfilingStore.strategyList.length) {
      return;
    }
  }

  watch(
    () => selectorStore.currentService,
    () => {
      inProcess.value = false;
      fetchStrategyList();
    },
  );
</script>
<style lang="scss" scoped>
  .profile-task-list {
    width: 300px;
    height: 98%;
    overflow: auto;
    border-right: 1px solid var(--sw-trace-list-border);
  }

  .item span {
    height: 21px;
  }

  .profile-td {
    padding: 10px 5px 10px 10px;
    border-bottom: 1px solid rgb(0 0 0 / 7%);

    &.selected {
      background-color: var(--sw-list-selected);
    }
  }

  .no-data {
    text-align: center;
    margin-top: 10px;
  }

  .profile-t-wrapper {
    overflow: auto;
    flex-grow: 1;
  }

  .profile-t {
    width: 100%;
    border-spacing: 0;
    table-layout: fixed;
    flex-grow: 1;
    position: relative;
    border: none;
  }

  .profile-tr {
    &:hover {
      background-color: var(--sw-list-hover);
    }
  }

  .profile-t-tool {
    padding: 10px 5px 10px 10px;
    border-bottom: 1px solid rgb(0 0 0 / 7%);
    background-color: var(--sw-table-header);
    width: 100%;
    font-weight: bold;
  }

  .new-task {
    float: right;
    color: $font-color;
  }

  .reload {
    margin-left: 30px;
  }
</style>
