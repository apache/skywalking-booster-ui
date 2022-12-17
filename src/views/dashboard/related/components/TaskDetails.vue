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
  <div class="profile-detail flex-v">
    <div>
      <h5 class="mb-10">{{ t("task") }}.</h5>
      <div class="mb-10 clear item">
        <span class="g-sm-4 grey">{{ t("taskId") }}:</span>
        <span class="g-sm-8 wba">
          {{ details.taskId }}
        </span>
      </div>
      <div class="mb-10 clear item">
        <span class="g-sm-4 grey">{{ t("service") }}:</span>
        <span class="g-sm-8 wba">
          {{ details.serviceName }}
        </span>
      </div>
      <div class="mb-10 clear item">
        <span class="g-sm-4 grey">{{ t("labels") }}:</span>
        <span class="g-sm-8 wba">
          {{ details.processLabels.join(";") }}
        </span>
      </div>
      <div class="mb-10 clear item">
        <span class="g-sm-4 grey">{{ t("monitorTime") }}:</span>
        <span class="g-sm-8 wba">
          {{ dateFormat(details.taskStartTime) }}
        </span>
      </div>
      <div class="mb-10 clear item">
        <span class="g-sm-4 grey">{{ t("monitorDuration") }}:</span>
        <span class="g-sm-8 wba"> {{ details.fixedTriggerDuration / 60 }} min </span>
      </div>
      <div class="mb-10 clear item">
        <span class="g-sm-4 grey">{{ t("triggerType") }}:</span>
        <span class="g-sm-8 wba">{{ details.triggerType }}</span>
      </div>
      <div class="mb-10 clear item">
        <span class="g-sm-4 grey">{{ t("targetType") }}:</span>
        <span class="g-sm-8 wba">{{ details.targetType }}</span>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import type { PropType } from "vue";
  import dayjs from "dayjs";
  import { useI18n } from "vue-i18n";
  import type { EBPFTaskList } from "@/types/ebpf";

  /*global defineProps */
  defineProps({
    details: {
      type: Object as PropType<EBPFTaskList>,
      default: () => ({}),
    },
  });
  const { t } = useI18n();
  const dateFormat = (date: number, pattern = "YYYY-MM-DD HH:mm:ss") => dayjs(date).format(pattern);
</script>
<style lang="scss" scoped>
  .item span {
    height: 21px;
  }
</style>
