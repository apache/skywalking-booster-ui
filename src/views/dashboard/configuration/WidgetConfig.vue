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
    <div class="metric">
      <label>Graph your metric</label>
    </div>
    <div class="visualization">
      <label>Select you visualization</label>
    </div>
    <div class="graph-styles">
      <label>Graph styles</label>
    </div>
    <div>
      <label>Widget options</label>
    </div>
    <div>
      <label>Standard options</label>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
</script>
<style lang="scss" scoped>
.ds-config {
  width: 340px;
  background-color: #fff;
  box-shadow: 2px 0 2px 0 #ccc;
  text-align: center;
  border-left: 1px solid #eee;
}

.configuration {
  z-index: 9999;
}

.graph {
  width: 100%;
  height: 350px;
}

label {
  font-weight: bold;
}
</style>
