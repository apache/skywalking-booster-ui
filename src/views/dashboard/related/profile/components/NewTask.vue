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
  <div class="profile-task">
    <div>
      <div class="label">{{ t("endpointName") }}</div>
      <Selector
        class="profile-input"
        size="small"
        :value="endpointName"
        :options="profileStore.endpoints"
        placeholder="Select a endpoint"
        :isRemote="true"
        @change="changeEndpoint"
        @query="searchEndpoints"
      />
    </div>
    <div>
      <div class="label">{{ t("monitorTime") }}</div>
      <div>
        <Radio class="mb-5" :value="monitorTime" :options="InitTaskField.monitorTimeEn" @change="changeMonitorTime" />
        <span class="date">
          <TimePicker :value="time" position="bottom" format="YYYY-MM-DD HH:mm:ss" @input="changeTimeRange" />
        </span>
      </div>
    </div>
    <div>
      <div class="label">{{ t("monitorDuration") }}</div>
      <Radio
        class="mb-5"
        :value="monitorDuration"
        :options="InitTaskField.monitorDuration"
        @change="changeMonitorDuration"
      />
    </div>
    <div>
      <div class="label">{{ t("minThreshold") }} (ms)</div>
      <el-input-number size="small" class="profile-input" :min="0" v-model="minThreshold" />
    </div>
    <div>
      <div class="label">{{ t("dumpPeriod") }}</div>
      <Radio class="mb-5" :value="dumpPeriod" :options="InitTaskField.dumpPeriod" @change="changeDumpPeriod" />
    </div>
    <div>
      <div class="label">{{ t("maxSamplingCount") }}</div>
      <Selector
        size="small"
        :value="maxSamplingCount"
        :options="InitTaskField.maxSamplingCount"
        placeholder="Select a data"
        @change="changeMaxSamplingCount"
        class="profile-input"
      />
    </div>
    <div>
      <el-button @click="createTask" type="primary" class="create-task-btn">
        {{ t("createTask") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useProfileStore } from "@/store/modules/profile";
  import { useSelectorStore } from "@/store/modules/selectors";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { ElMessage } from "element-plus";
  import { InitTaskField } from "./data";
  /* global defineEmits */
  const emits = defineEmits(["close"]);
  const profileStore = useProfileStore();
  const selectorStore = useSelectorStore();
  const appStore = useAppStoreWithOut();
  const { t } = useI18n();
  const endpointName = ref<string>("");
  const monitorTime = ref<string>(InitTaskField.monitorTimeEn[0].value);
  const monitorDuration = ref<string>(InitTaskField.monitorDuration[0].value);
  const time = ref<Date>(appStore.durationRow.start);
  const minThreshold = ref<number>(0);
  const dumpPeriod = ref<string>(InitTaskField.dumpPeriod[0].value);
  const maxSamplingCount = ref<string>(InitTaskField.maxSamplingCount[0].value);

  async function searchEndpoints(keyword: string) {
    if (!selectorStore.currentService) {
      return;
    }
    const service = selectorStore.currentService.id;
    const res = await profileStore.getEndpoints(service, keyword);

    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    endpointName.value = profileStore.taskEndpoints[0].value;
  }

  function changeMonitorTime(opt: string) {
    monitorTime.value = opt;
  }

  function changeMonitorDuration(val: string) {
    monitorDuration.value = val;
  }

  function changeDumpPeriod(val: string) {
    dumpPeriod.value = val;
  }

  function changeMaxSamplingCount(opt: any[]) {
    maxSamplingCount.value = opt[0].value;
  }

  function changeEndpoint(opt: any[]) {
    endpointName.value = opt[0].value;
  }

  async function createTask() {
    emits("close");
    const date = monitorTime.value === "0" ? new Date() : time.value;
    const params = {
      serviceId: selectorStore.currentService.id,
      endpointName: endpointName.value,
      startTime: date.getTime(),
      duration: Number(monitorDuration.value),
      minDurationThreshold: Number(minThreshold.value),
      dumpPeriod: Number(dumpPeriod.value),
      maxSamplingCount: Number(maxSamplingCount.value),
    };
    const res = await profileStore.createTask(params);
    if (res.errors) {
      ElMessage.error(res.errors);
      return;
    }
    const { tip } = res.data;
    if (tip) {
      ElMessage.error(tip);
      return;
    }
    ElMessage.success("Task created successfully");
  }
  function changeTimeRange(val: Date) {
    time.value = val;
  }
</script>
<style lang="scss" scoped>
  .profile-task {
    margin: 0 auto;
    width: 400px;
  }

  .date {
    font-size: $font-size-smaller;
  }

  .label {
    margin-top: 10px;
    font-size: $font-size-normal;
  }

  .profile-input {
    width: 300px;
  }

  .create-task-btn {
    width: 300px;
    margin-top: 50px;
  }
</style>
