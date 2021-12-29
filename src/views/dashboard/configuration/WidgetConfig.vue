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
  <div class="graph">No Data</div>
  <div class="config">
    <div class="metric-config item">
      <label>Graph your metric</label>
      <div class="name">Metrics</div>
      <Selector
        :value="states.metrics"
        :options="metricOpts"
        :multiple="true"
        size="mini"
        placeholder="Select a metric"
        @change="changeMetrics"
        class="selectors"
      />
      <Selector
        :value="states.metrics"
        :options="metricOpts"
        :multiple="true"
        size="mini"
        placeholder="Select a metric"
        @change="changeMetrics"
        class="selectors"
      />
    </div>
    <div class="visualization item">
      <label>Select you visualization</label>
    </div>
    <div class="graph-styles item">
      <label>Graph styles</label>
    </div>
    <div class="item">
      <label>Widget options</label>
    </div>
    <div class="item">
      <label>Standard options</label>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive } from "vue";

const states = reactive<any>({
  metrics: "",
});
function changeMetrics(val: string[]) {
  console.log(val);
}
const metricOpts = [
  { value: "service_apdex", label: "service_apdex" },
  { value: "service_sla", label: "service_sla" },
  { value: "service_cpm", label: "service_cpm" },
  { value: "service_resp_time", label: "service_resp_time" },
  { value: "service_percentile", label: "service_percentile" },
  { value: "service_mq_consume_latency", label: "service_mq_consume_latency" },
  { value: "service_mq_consume_count", label: "service_mq_consume_count" },
];
</script>
<style lang="scss" scoped>
.item {
  margin: 20px 0;
}

.graph {
  width: 100%;
  height: 350px;
}

label {
  display: inline-block;
  font-weight: bold;
  margin-bottom: 10px;
}

.selectors {
  width: 500px;
  margin-right: 10px;
}

.name {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
}
</style>
