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
  <div>tree</div>
</template>
<script lang="ts" setup>
import { watch } from "vue";
import { useEbpfStore } from "@/store/modules/ebpf";

const ebpfStore = useEbpfStore();

function sortArr(arr: any[]) {
  const copyArr = JSON.parse(JSON.stringify(arr));
  const obj: any = {};
  const res = [];
  for (const item of copyArr) {
    obj[item.id] = item;
  }
  for (const item of copyArr) {
    if (item.parentId === "0") {
      item.name = item.symbol;
      item.value = item.dumpCount;
      res.push(item);
    }
    for (const key in obj) {
      if (item.id === obj[key].parentId) {
        obj[key].name = obj[key].symbol;
        obj[key].value = obj[key].dumpCount;
        if (item.children) {
          item.children.push(obj[key]);
        } else {
          item.children = [obj[key]];
        }
      }
    }
  }
  console.log(res);
  return res;
}
watch(
  () => ebpfStore.analyzeTrees,
  () => {
    sortArr(ebpfStore.analyzeTrees);
  }
);
</script>
