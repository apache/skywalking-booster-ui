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
  <div class="dashboard-tool">
    <el-button size="mini">Save As</el-button>
    <el-button size="mini">Discard</el-button>
    <el-button size="mini" type="primary">Apply</el-button>
  </div>
  <div class="flex-h ds-main">
    <div class="ds-layout">
      <GridLayout />
    </div>
    <div class="ds-config">Configurations</div>
  </div>
</template>
<script lang="ts" setup>
import { toRefs, defineComponent, reactive, ref } from "vue";
import { ElButton } from "element-plus";
import GridLayout from "./widget/GridLayout.vue";
</script>
<style lang="scss" scoped>
.dashboard-tool {
  text-align: right;
  padding: 5px 10px;
  background: rgb(240, 242, 245);
  border-bottom: 1px solid #ccc;
}

.ds-main {
  background: #f7f9fa;
  // background: #eee;
}

.ds-layout {
  // background: rgb(240, 242, 245);
  // background-color: #fafbfc;
  height: 890px;
  flex-grow: 2;
  overflow: auto;
  // padding: 0 5px;
}

.ds-config {
  width: 360px;
  margin: 5px 0;
  background-color: #fff;
  box-shadow: 5px 5px 5px #fff;
  text-align: center;
}

.panel {
  width: 300px;
  height: 300px;
  background-color: #fff;
  margin: 5px;
  text-align: center;
}
</style>
