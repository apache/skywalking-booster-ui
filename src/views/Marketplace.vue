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
    <div>
      <el-input v-model="searchText" placeholder="Please input name" class="input-with-search" @change="searchMenus">
        <template #append>
          <el-button size="small">
            <Icon size="sm" iconName="search" />
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="category-body flex-h">
      <div class="mr-20 mt-10 flex-h category">
        <el-card
          class="item"
          v-for="(menu, index) in menus"
          :key="index"
          @click="handleItems(menu)"
          :class="currentItems.name === menu.name ? 'active' : ''"
        >
          <router-link :to="menu.hasGroup ? '' : menu.path || ''">
            <div class="title" :class="menu.activate ? (menu.hasGroup ? '' : 'actived-font') : 'disabled'">
              {{ te(menu.i18nKey) ? t(menu.i18nKey) : menu.title }}
            </div>
          </router-link>
          <div class="mt-10"> {{ te(menu.descKey) ? t(menu.descKey) : "" }} </div>
          <el-link :href="menu.documentLink" target="_blank" class="link" v-show="menu.documentLink">
            <el-button class="mt-10" size="small" type="primary"> {{ t("document") }} </el-button>
          </el-link>
        </el-card>
      </div>
      <div class="mt-10 cards">
        <el-card shadow="hover" v-for="(item, index) in currentItems.subItems || []" :key="index" class="card">
          <router-link :to="item.path || ''">
            <div class="title" :class="item.activate ? 'actived-font' : 'disabled'">
              {{ te(item.i18nKey) ? t(item.i18nKey) : item.title }}
            </div>
          </router-link>
          <div class="mt-10"> {{ te(item.descKey) ? t(item.descKey) : "" }} </div>
          <el-link :href="item.documentLink" target="_blank" class="link" v-show="item.documentLink">
            <el-button class="mt-10" size="small" type="primary"> {{ t("document") }} </el-button>
          </el-link>
        </el-card>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import type { MenuOptions, SubItem } from "@/types/app";

  const { t, te } = useI18n();
  const appStore = useAppStoreWithOut();
  const currentItems = ref<MenuOptions>(appStore.allMenus[0] || {});
  const searchText = ref<string>("");
  const menus = ref<MenuOptions[]>(appStore.allMenus || []);

  function handleItems(item: MenuOptions) {
    currentItems.value = item;
  }

  function searchMenus() {
    if (!searchText.value) {
      menus.value = appStore.allMenus;
      return;
    }

    menus.value = appStore.allMenus.filter(
      (item: MenuOptions) =>
        (te(item.i18nKey) ? t(item.i18nKey) : item.title).toLowerCase().includes(searchText.value.toLowerCase()) ||
        !!item.subItems.find((subItem: SubItem) =>
          (te(subItem.i18nKey) ? t(subItem.i18nKey) : item.title)
            .toLowerCase()
            .includes(searchText.value.toLowerCase()),
        ),
    );
    currentItems.value = menus.value[0] || {};
  }
</script>
<style lang="scss" scoped>
  .menus {
    flex-grow: 1;
    height: 100%;
    font-size: $font-size-smaller;
    padding: 10px;
  }

  .category-body {
    padding-left: 20px 30px;
    width: 100%;
    height: 100%;
    justify-content: space-between;
  }

  .title {
    font-weight: bold;
    font-size: 14px;
  }

  .actived-font {
    color: $active-color;
  }

  .disabled {
    color: #aaa;
  }

  .card {
    margin-bottom: 30px;
    cursor: pointer;
    width: 380px;
  }

  .cards {
    min-width: 400px;
    height: 100%;
    overflow: auto;
  }

  .item {
    margin-bottom: 20px;
    margin-right: 10px;
    width: 300px;
    cursor: pointer;
  }

  .input-with-search {
    width: 300px;
  }

  .category {
    flex-wrap: wrap;
    border-right: 1px solid var(--sw-marketplace-border);
    align-content: flex-start;
    height: 100%;
    overflow: auto;
  }

  .link {
    float: right;
    margin-bottom: 20px;
  }

  .active {
    border: 1px solid $active-color;
  }
</style>
