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
  <div class="service-table">
    <el-table :data="tableData" :span-method="objectSpanMethod" border>
      <el-table-column
        v-for="(h, index) in tableHeader"
        :label="t(h)"
        :key="h + index"
      >
        <template #default="scope">
          <router-link
            :to="`${state.path}/${scope.row.serviceName}/metrics`"
            v-if="h === tableHeader[1] && index !== 0"
          >
            <span class="service-name cp">{{ scope.row[h] }}</span>
          </router-link>
          <span v-else>{{ scope.row[h] }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { ElTable, ElTableColumn } from "element-plus";

const route = useRoute();
const { t } = useI18n();
const tableHeader = [
  "groupName",
  "serviceName",
  "types",
  "technologies",
  "endpoints",
  "health",
];
const tableData = [
  {
    endpoints: 2,
    groupName: "group 1",
    serviceName: "discount",
    types: "HTTP",
    health: true,
    technologies: "Spring Boot",
  },
  {
    endpoints: 3,
    groupName: "group 1",
    serviceName: "frontend",
    types: "HTTP",
    health: true,
    technologies: "Node.js",
  },
  {
    endpoints: 3,
    groupName: "group 2",
    serviceName: "web",
    types: "",
    health: true,
    technologies: "Nginx",
  },
  {
    endpoints: 3,
    groupName: "group 2",
    serviceName: "shipping",
    types: "HTTP",
    health: true,
    technologies: "JVM",
  },
  {
    endpoints: 3,
    groupName: "group 3",
    serviceName: "payment",
    types: "HTTP MESSAGING",
    health: true,
    technologies: "RabbitMQ Python",
  },
];
const state = reactive({
  path: route.meta.headPath,
});
const objectSpanMethod = (item: { columnIndex: number; rowIndex: number }) => {
  if (item.columnIndex === 0) {
    if (item.rowIndex % 2 === 0) {
      return {
        rowspan: 2,
        colspan: 1,
      };
    } else {
      return {
        rowspan: 0,
        colspan: 0,
      };
    }
  }
};
watch(
  () => route.meta.headPath,
  (path: unknown) => {
    if (!path) {
      return;
    }
    state.path = path;
  }
);
</script>
<style lang="scss" scoped>
.service-name {
  color: #448edf;
  cursor: pointer;
}
.service-table {
  padding: 15px;
}
</style>
