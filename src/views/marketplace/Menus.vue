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
  <div class="menus flex-v">
    <el-tree
      :data="menus"
      show-checkbox
      node-key="id"
      :default-expanded-keys="[2, 3]"
      :default-checked-keys="[5]"
      :props="defaultProps"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useAppStoreWithOut } from "@/store/modules/app";

  const appStore = useAppStoreWithOut();
  const menus = ref<any[]>([]);
  const expandedKeys = ref<string[]>([]);
  const checkedKeys = ref<string[]>([]);
  const defaultProps = {
    children: "subItems",
    label: "title",
  };

  appStore.setPageTitle("Menus");
  getMenus();

  async function getMenus() {
    const resp = (await appStore.queryMenuItems()) || {};
    menus.value = (resp.getMenuItems || []).map((d: any, index: number) => {
      d.id = String(index);
      expandedKeys.value.push(d.id);
      checkedKeys.value.push(d.id);
      d.subItem = d.subItems.map((item: any, subIndex: number) => {
        item.id = `${index} + ${subIndex}`;
        expandedKeys.value.push(item.id);
        checkedKeys.value.push(item.id);
        return item;
      });
      return d;
    });
    console.log(menus.value);
  }
  // window.localStorage.setItem("menus", lang.value);
</script>
<style lang="scss" scoped>
  .menus {
    flex-grow: 1;
    height: 100%;
    font-size: $font-size-smaller;
    padding: 20px;
  }
</style>
