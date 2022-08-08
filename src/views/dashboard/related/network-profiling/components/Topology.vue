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
  <div ref="topology" class="topology"></div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useEbpfStore } from "@/store/modules/ebpf";
import { useSelectorStore } from "@/store/modules/selectors";
import { useAppStoreWithOut } from "@/store/modules/app";

const selectorStore = useSelectorStore();
const ebpfStore = useEbpfStore();
const appStore = useAppStoreWithOut();

onMounted(() => {
  getTopology();
});

function getTopology() {
  const serviceInstanceId =
    (selectorStore.currentPod && selectorStore.currentPod.id) || "";
  ebpfStore.getProcessTopology({
    serviceInstanceId,
    duration: appStore.durationTime,
  });
}
</script>
<style lang="scss" scoped>
.topology {
  width: calc(100% - 5px);
  margin: 0 5px 5px 0;
  height: 100%;
  min-height: 150px;
}
</style>
