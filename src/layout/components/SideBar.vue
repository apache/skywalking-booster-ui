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
      default-active="0"
      text-color="#efefef"
      :unique-opened="true"
      :collapse="isCollapse"
      :style="{ border: 'none' }"
    >
      <template v-for="(menu, index) in routes" :key="index">
        <el-sub-menu :index="String(index)" v-if="menu.meta.hasGroup">
          <template #title>
            <router-link :to="menu.path" :exact="menu.meta.exact || false">
              <el-icon class="menu-icons" :style="{ marginRight: '12px' }">
                <Icon size="lg" :iconName="menu.meta.icon" />
              </el-icon>
              <span>{{ t(menu.meta.title) }}</span>
            </router-link>
          </template>
          <el-menu-item-group>
            <el-menu-item
              v-for="(m, idx) in filterMenus(menu.children)"
              :index="`${index}-${idx}`"
              :key="idx"
            >
              <router-link :to="m.path" :exact="m.meta.exact || false">
                <span>{{ t(m.meta.title) }}</span>
              </router-link>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item :index="String(index)" @click="changePage(menu)" v-else>
          <el-icon class="menu-icons" :style="{ margin: '-10px 12px 0 0' }">
            <router-link :to="menu.children[0].path" :exact="menu.meta.exact">
              <Icon size="lg" :iconName="menu.meta.icon" />
            </router-link>
          </el-icon>
          <template #title>
            <router-link :to="menu.children[0].path" :exact="menu.meta.exact">
              <span>{{ t(menu.meta.title) }}</span>
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
import { useRouter, RouteRecordRaw, RouteRecordName } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElMenuItemGroup,
  ElIcon,
} from "element-plus";
const { t } = useI18n();
const name: RouteRecordName | null | undefined = String(
  useRouter().currentRoute.value.name
);
const theme = ["VirtualMachine", "Kubernetes"].includes(name || "")
  ? ref("light")
  : ref("black");
const routes = useRouter().options.routes;
const isCollapse = ref(false);
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

<style lang="scss" scope>
.side-bar {
  position: relative;
  height: 100%;
  background: #252a2f;
  font-weight: bold;
  // box-shadow: 1px 5px 3px #888;
}
.el-menu-vertical:not(.el-menu--collapse) {
  width: 210px;
  font-size: 18px;
}
.logo-icon-collapse {
  width: 65px;
  margin: 15px 0 30px 0;
}
.logo-icon {
  margin: 15px 0 30px 15px;
  width: 110px;
}
.el-sub-menu .el-icon {
  height: 26px;
  margin-right: 0;
}
.el-sub-menu__title {
  font-size: 16px;
  font-weight: bold;
}
.menu-control {
  position: absolute;
  top: 8px;
  left: 215px;
  cursor: pointer;
  transition: all 0.2s linear;
  z-index: 9999;
  color: #252a2f;
}
.menu-control.collapse {
  left: 70px;
}
.el-icon.el-sub-menu__icon-arrow {
  height: 12px;
}
</style>
