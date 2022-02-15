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
  <Graph :option="option" v-loading="loading" />
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useTopologyStore } from "@/store/modules/topology";
import { useDashboardStore } from "@/store/modules/dashboard";
import { EntityType } from "../../data";
import { ElMessage } from "element-plus";

const topologyStore = useTopologyStore();
const dashboardStore = useDashboardStore();
const loading = ref<boolean>(false);
const option = computed(() => getOption());

onMounted(async () => {
  loading.value = true;
  const resp = await getTopology();
  loading.value = false;
  if (resp && resp.errors) {
    ElMessage.error(resp.errors);
  }
});

function getOption() {
  return {
    tooltip: {
      trigger: "item",
    },
    series: {
      type: "sankey",
      left: 40,
      top: 20,
      right: 300,
      bottom: 40,
      emphasis: { focus: "adjacency" },
      data: topologyStore.nodes,
      links: topologyStore.calls,
      label: {
        color: "#fff",
        formatter: (param: any) => param.data.name,
      },
      color: [
        "#3fe1da",
        "#6be6c1",
        "#3fcfdc",
        "#626c91",
        "#3fbcde",
        "#a0a7e6",
        "#3fa9e1",
        "#96dee8",
        "#bf99f8",
      ],
      itemStyle: {
        borderWidth: 0,
      },
      lineStyle: {
        color: "source",
        opacity: 0.12,
      },
      tooltip: {
        position: "bottom",
        formatter: (param: { data: any; dataType: string }) => {
          if (param.dataType === "edge") {
            return `${param.data.sourceObj.serviceName} -> ${param.data.targetObj.serviceName}`;
          }
          return param.data.serviceName;
        },
      },
    },
  };
}

async function getTopology() {
  let resp;
  switch (dashboardStore.entity) {
    case EntityType[2].value:
      resp = await topologyStore.getEndpointTopology();
      break;
    case EntityType[4].value:
      resp = await topologyStore.getInstanceTopology();
      break;
  }
  return resp;
}
</script>
<style lang="scss" scoped>
.sankey {
  width: 100%;
  height: 100%;
}
</style>
