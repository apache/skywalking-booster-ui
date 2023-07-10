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
      :data="appStore.activateMenus"
      show-checkbox
      node-key="id"
      default-expand-all
      :default-checked-keys="appStore.checkedKeys"
      :props="defaultProps"
    />
    <div class="footer flex-v">
      <el-button class="btn" size="small" type="primary" @click="getCheckedNodes">
        {{ t("saveReload") }}
      </el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";

  const appStore = useAppStoreWithOut();
  const { t } = useI18n();
  const treeRef = ref<InstanceType<any>>();
  const defaultProps = {
    children: "subItems",
    label: "title",
  };

  appStore.setPageTitle("Menus");

  function getCheckedNodes() {
    const checkedKeys = treeRef.value!.getCheckedKeys(false, false);

    window.localStorage.setItem("customMenus", JSON.stringify(checkedKeys));
    window.location.reload();
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
