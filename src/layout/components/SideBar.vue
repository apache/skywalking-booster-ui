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
  <div class="side-bar">
    <div :class="isCollapse ? 'logo-icon-collapse' : 'logo-icon'">
      <Icon
        :size="isCollapse ? 'xl' : 'logo'"
        :iconName="isCollapse ? 'logo' : 'logo-sw'"
      />
    </div>
    <el-menu
      active-text-color="#448dfe"
      background-color="#252a2f"
      class="el-menu-vertical"
      :default-active="name"
      text-color="#efefef"
      :unique-opened="true"
      :collapse="isCollapse"
      :style="{ border: 'none' }"
    >
      <template v-for="(menu, index) in routes" :key="index">
        <el-sub-menu :index="String(menu.name)" v-if="menu.meta.hasGroup">
          <template #title>
            <router-link
              class="items"
              :to="menu.path"
              :exact="menu.meta.exact || false"
            >
              <el-icon class="menu-icons" :style="{ marginRight: '12px' }">
                <Icon size="lg" :iconName="menu.meta.icon" />
              </el-icon>
              <span class="title" :class="isCollapse ? 'collapse' : ''">
                {{ t(menu.meta.title) }}
              </span>
            </router-link>
          </template>
          <el-menu-item-group>
            <el-menu-item
              v-for="(m, idx) in filterMenus(menu.children)"
              :index="m.name"
              :key="idx"
            >
              <router-link
                class="items"
                :to="m.path"
                :exact="(m.meta && m.meta.exact) || false"
              >
                <span class="title">{{ m.meta && t(m.meta.title) }}</span>
              </router-link>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item
          :index="String(menu.name)"
          @click="changePage(menu)"
          v-else
        >
          <el-icon class="menu-icons" :style="{ marginRight: '12px' }">
            <router-link
              class="items"
              :to="menu.children[0].path"
              :exact="menu.meta.exact"
            >
              <Icon size="lg" :iconName="menu.meta.icon" />
            </router-link>
          </el-icon>
          <template #title>
            <router-link
              class="items"
              :to="menu.children[0].path"
              :exact="menu.meta.exact"
            >
              <span class="title">{{ t(menu.meta.title) }}</span>
            </router-link>
          </template>
        </el-menu-item>
      </template>
    </el-menu>
    <div
      class="menu-control"
      :class="isCollapse ? 'collapse' : ''"
      :style="{
        color: theme === 'light' ? '#eee' : '#252a2f',
      }"
    >
      <Icon
        size="middle"
        iconName="format_indent_decrease"
        @click="controlMenu"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRouter, RouteRecordRaw } from "vue-router";
import { useI18n } from "vue-i18n";
import Icon from "@/components/Icon.vue";
import { useAppStoreWithOut } from "@/store/modules/app";

const appStore = useAppStoreWithOut();
const { t } = useI18n();
const name = ref<string>(String(useRouter().currentRoute.value.name));
const theme = ["VirtualMachine", "Kubernetes"].includes(name.value || "")
  ? ref("light")
  : ref("black");
const routes = ref<RouteRecordRaw[] | any>(useRouter().options.routes);
if (/Android|webOS|iPhone|iPod|iPad|BlackBerry/i.test(navigator.userAgent)) {
  appStore.setIsMobile(true);
} else {
  appStore.setIsMobile(false);
}
const isCollapse = ref(appStore.isMobile ? true : false);
const controlMenu = () => {
  isCollapse.value = !isCollapse.value;
};
const changePage = (menu: RouteRecordRaw) => {
  theme.value = ["VirtualMachine", "Kubernetes"].includes(String(menu.name))
    ? "light"
    : "black";
};
const filterMenus = (menus: any[]) => {
  return menus.filter((d) => d.meta && !d.meta.notShow);
};
</script>

<style lang="scss" scoped>
.side-bar {
  background: #252a2f;
  height: 100%;
  min-height: 700px;
  position: relative;
  margin-bottom: 100px;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
  font-size: 16px;
}

.logo-icon-collapse {
  width: 65px;
  margin: 15px 0 10px 0;
  text-align: center;
}

span.collapse {
  height: 0;
  width: 0;
  overflow: hidden;
  visibility: hidden;
  display: inline-block;
}

.logo-icon {
  margin: 15px 0 10px 20px;
  width: 110px;
}

.menu-control {
  position: absolute;
  top: 7px;
  left: 200px;
  cursor: pointer;
  transition: all 0.2s linear;
  z-index: 99;
  color: #252a2f;
}

.menu-control.collapse {
  left: 70px;
}

.el-icon.el-sub-menu__icon-arrow {
  height: 12px;
}

.items {
  display: inline-block;
  width: 100%;
}

.version {
  color: #eee;
  font-size: 12px;
  cursor: pointer;
  padding-left: 23px;
  margin-bottom: 10px;
  position: absolute;
  bottom: 0;
  left: 10px;
}

.empty {
  width: 100%;
  height: 60px;
}

.title {
  display: inline-block;
  max-width: 110px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
