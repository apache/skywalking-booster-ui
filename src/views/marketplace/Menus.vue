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
      ref="treeRef"
      :data="activateMenus"
      show-checkbox
      node-key="id"
      default-expand-all
      :default-checked-keys="checkedKeys"
      :props="defaultProps"
    />
    <div class="footer flex-v">
      <el-button class="btn" size="small" type="primary" @click="getCheckedNodes">
        {{ t("save") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { MenuOptions } from "@/types/app";
  import { useAppStoreWithOut } from "@/store/modules/app";

  const appStore = useAppStoreWithOut();
  const { t } = useI18n();
  const treeRef = ref<InstanceType<any>>();
  const activateMenus = ref<MenuOptions[]>([]);
  const checkedKeys = ref<string[]>([]);
  const defaultProps = {
    children: "subItems",
    label: "title",
  };

  appStore.setPageTitle("Menus");
  getActivateMenus();

  function getCheckedNodes() {
    checkedKeys.value = treeRef.value!.getCheckedKeys(false);
    setCurrentMenus();
    window.localStorage.setItem("customMenus", JSON.stringify(checkedKeys.value));
  }

  async function getActivateMenus() {
    const resp = (await appStore.queryMenuItems()) || {};
    const menus = (resp.getMenuItems || []).map((d: MenuOptions, index: number) => {
      d.id = String(index);
      if (d.subItems) {
        d.subItems = d.subItems.map((item: MenuOptions, subIndex: number) => {
          item.id = `${index}-${subIndex}`;
          return item;
        });
      } else {
        d.subItem = [];
      }

      return d;
    });
    activateMenus.value = menus.filter((d: MenuOptions) => {
      if (d.activate) {
        d.subItems = d.subItems.filter((item: MenuOptions) => {
          if (item.activate) {
            return item;
          }
        });
        return d;
      }
    });
    const customMenus = localStorage.getItem("customMenus");
    if (customMenus) {
      checkedKeys.value = JSON.parse(customMenus);
    } else {
      for (const menus of activateMenus.value) {
        checkedKeys.value.push(menus.id);
        for (const item of menus.subItems) {
          checkedKeys.value.push(item.id);
        }
      }
      window.localStorage.setItem("customMenus", JSON.stringify(checkedKeys.value));
    }
    setCurrentMenus();
  }

  function setCurrentMenus() {
    const current = activateMenus.value.filter((d: MenuOptions) => {
      if (checkedKeys.value.includes(d.id)) {
        d.subItems = d.subItems.filter((item: MenuOptions) => {
          if (checkedKeys.value.includes(item.id)) {
            return item;
          }
        });
        return d;
      }
    });
    appStore.setCurrentMenus(current);
  }
</script>
<style lang="scss" scoped>
  .menus {
    flex-grow: 1;
    height: 100%;
    font-size: $font-size-smaller;
    padding: 10px;
  }

  .footer {
    padding: 80px 10px 20px;
    background-color: #fff;
  }

  .btn {
    width: 150px;
  }
</style>
