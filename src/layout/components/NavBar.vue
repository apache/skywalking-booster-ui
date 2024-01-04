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
  <div class="nav-bar flex-h">
    <el-breadcrumb
      :separator-icon="ArrowRight"
      class="title flex-h"
      v-if="pathNames.length"
      :style="{ '--el-text-color-placeholder': '#666' }"
    >
      <el-breadcrumb-item
        v-for="(path, index) in pathNames"
        :key="index"
        :replace="true"
        :to="{ path: getName(path).path || '' }"
      >
        <el-dropdown size="small" placement="bottom" :persistent="false">
          <span class="cp name">{{ getName(path).name }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="setName(p)" v-for="(p, index) in path" :key="index">
                <span>{{ p.name }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="title" v-else>{{ pageTitle }}</div>
    <div class="app-config">
      <span class="red" v-show="timeRange">{{ t("timeTips") }}</span>
      <TimePicker
        :value="[appStore.durationRow.start, appStore.durationRow.end]"
        position="bottom"
        format="YYYY-MM-DD HH:mm"
        @input="changeTimeRange"
      />
      <span> UTC{{ appStore.utcHour >= 0 ? "+" : "" }}{{ `${appStore.utcHour}:${appStore.utcMin}` }} </span>
      <span class="ml-5" ref="themeSwitchRef">
        <el-switch
          v-model="theme"
          :active-icon="Moon"
          :inactive-icon="Sunny"
          inline-prompt
          @change="handleChangeTheme"
        />
      </span>
      <span title="refresh" class="ghost ml-5 cp" @click="handleReload">
        <Icon iconName="retry" :loading="appStore.autoRefresh" class="middle" />
      </span>
      <span class="version ml-5 cp">
        <el-popover trigger="hover" width="250" placement="bottom" :content="appStore.version">
          <template #reference>
            <span>
              <Icon iconName="info_outline" size="middle" />
            </span>
          </template>
        </el-popover>
      </span>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { Themes } from "@/constants/data";
  import router from "@/router";
  import { useAppStoreWithOut } from "@/store/modules/app";
  import { useDashboardStore } from "@/store/modules/dashboard";
  import type { DashboardItem } from "@/types/dashboard";
  import timeFormat from "@/utils/timeFormat";
  import { MetricCatalog } from "@/views/dashboard/data";
  import { ArrowRight, Moon, Sunny } from "@element-plus/icons-vue";
  import { ElMessage } from "element-plus";
  import { ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useRoute } from "vue-router";

  /*global Indexable */
  const { t, te } = useI18n();
  const appStore = useAppStoreWithOut();
  const dashboardStore = useDashboardStore();
  const route = useRoute();
  const pathNames = ref<{ path?: string; name: string; selected: boolean }[][]>([]);
  const timeRange = ref<number>(0);
  const pageTitle = ref<string>("");
  const theme = ref<boolean>(true);
  const themeSwitchRef = ref<HTMLElement>();

  const savedTheme = window.localStorage.getItem("theme-is-dark");
  if (savedTheme === "false") {
    theme.value = false;
  }
  if (savedTheme === "") {
    // read the theme preference from system setting if there is no user setting
    theme.value = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  changeTheme();
  resetDuration();
  getVersion();
  getNavPaths();

  function changeTheme() {
    const root = document.documentElement;

    if (theme.value) {
      root.classList.add(Themes.Dark);
      root.classList.remove(Themes.Light);
      appStore.setTheme(Themes.Dark);
    } else {
      root.classList.add(Themes.Light);
      root.classList.remove(Themes.Dark);
      appStore.setTheme(Themes.Light);
    }
    window.localStorage.setItem("theme-is-dark", String(theme.value));
  }

  function handleChangeTheme() {
    const x = themeSwitchRef.value?.offsetLeft ?? 0;
    const y = themeSwitchRef.value?.offsetTop ?? 0;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    // compatibility handling
    if (!document.startViewTransition) {
      changeTheme();
      return;
    }
    // api: https://developer.chrome.com/docs/web-platform/view-transitions
    const transition = document.startViewTransition(() => {
      changeTheme();
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
      document.documentElement.animate(
        {
          clipPath: !theme.value ? clipPath.reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "ease-in",
          pseudoElement: !theme.value ? "::view-transition-old(root)" : "::view-transition-new(root)",
        },
      );
    });
  }

  function getName(list: any[]) {
    return list.find((d: any) => d.selected) || {};
  }

  function setName(item: any) {
    pathNames.value = pathNames.value.map((list: { path?: string; name: string; selected: boolean }[]) => {
      const p = list.find((i: any) => i.entity === item.entity && item.layer === i.layer && i.name === item.name);
      if (p) {
        list = list.map((d: any) => {
          d.selected = false;
          if (d.entity === item.entity && item.layer === d.layer && d.name === item.name) {
            d.selected = true;
          }
          return d;
        });
      }

      return list;
    });
    item.path && router.push(item.path);
  }

  function handleReload() {
    const gap = appStore.duration.end.getTime() - appStore.duration.start.getTime();
    const dates: Date[] = [new Date(new Date().getTime() - gap), new Date()];
    appStore.setDuration(timeFormat(dates));
  }

  function changeTimeRange(val: Date[]) {
    timeRange.value = val[1].getTime() - val[0].getTime() > 60 * 24 * 60 * 60 * 1000 ? 1 : 0;
    if (timeRange.value) {
      return;
    }
    appStore.setDuration(timeFormat(val));
  }

  function getNavPaths() {
    pathNames.value = [];
    pageTitle.value = "";
    const dashboard = dashboardStore.currentDashboard;

    if (!(dashboard && dashboard.name)) {
      updateNavTitle();
      return;
    }
    const root =
      dashboardStore.dashboards.filter((d: DashboardItem) => d.isRoot && dashboard.layer === d.layer)[0] || {};
    for (const item of appStore.allMenus) {
      if (item.subItems && item.subItems.length) {
        for (const subItem of item.subItems) {
          if (subItem.layer === root.layer) {
            root.path = subItem.path;
          }
        }
      } else {
        if (item.layer === root.layer) {
          root.path = item.path;
        }
      }
    }
    pathNames.value.push([{ ...root, selected: true }]);
    if (dashboard.entity === MetricCatalog.ALL) {
      return;
    }
    if (dashboard.entity === MetricCatalog.SERVICE) {
      pathNames.value.push([
        {
          name: dashboard.name,
          selected: true,
        },
      ]);
      return;
    }
    const serviceDashboards = dashboardStore.dashboards.filter(
      (d: DashboardItem) => MetricCatalog.SERVICE === d.entity && dashboard.layer === d.layer,
    );
    if (!serviceDashboards.length) {
      return;
    }

    const serviceId = route.params.serviceId;
    const list = serviceDashboards.map((d: { path: string } & DashboardItem, index: number) => {
      let path = `/dashboard/${d.layer}/${d.entity}/${d.name}`;
      if (serviceId) {
        path = `/dashboard/${d.layer}/${d.entity}/${serviceId}/${d.name}`;
      }
      const selected = index === 0;
      return {
        ...d,
        path,
        selected,
      };
    });
    pathNames.value.push(list);
    const podId = route.params.podId;
    if (dashboard.entity === MetricCatalog.ENDPOINT_RELATION) {
      const endpointDashboards = dashboardStore.dashboards.filter(
        (d: DashboardItem) => MetricCatalog.ENDPOINT === d.entity && dashboard.layer === d.layer,
      );
      const list = endpointDashboards.map((d: { path: string } & DashboardItem, index: number) => {
        let path = `/dashboard/${d.layer}/${d.entity}/${d.name}`;
        if (podId) {
          path = `/dashboard/${d.layer}/${d.entity}/${serviceId}/${podId}/${d.name}`;
        }
        const selected = index === 0;
        return {
          ...d,
          path,
          selected,
        };
      });

      pathNames.value.push(list);
    }
    const destServiceId = route.params.destServiceId;
    if (dashboard.entity === MetricCatalog.SERVICE_INSTANCE_RELATION) {
      const serviceRelationDashboards = dashboardStore.dashboards.filter(
        (d: DashboardItem) => MetricCatalog.SERVICE_RELATION === d.entity && dashboard.layer === d.layer,
      );
      const list = serviceRelationDashboards.map((d: { path: string } & DashboardItem, index: number) => {
        let path = `/dashboard/${d.layer}/${d.entity}/${d.name}`;
        if (destServiceId) {
          path = `/dashboard/related/${d.layer}/${d.entity}/${serviceId}/${destServiceId}/${d.name}`;
        }
        const selected = index === 0;
        return {
          ...d,
          path,
          selected,
        };
      });
      pathNames.value.push(list);
    }
    if ([MetricCatalog.Process, MetricCatalog.PROCESS_RELATION].includes(dashboard.entity)) {
      const InstanceDashboards = dashboardStore.dashboards.filter(
        (d: DashboardItem) => MetricCatalog.SERVICE_INSTANCE === d.entity && dashboard.layer === d.layer,
      );
      const list = InstanceDashboards.map((d: { path: string } & DashboardItem, index: number) => {
        let path = `/dashboard/${d.layer}/${d.entity}/${d.name}`;
        if (podId) {
          path = `/dashboard/${d.layer}/${d.entity}/${serviceId}/${podId}/${d.name}`;
        }
        const selected = index === 0;
        return {
          ...d,
          path,
          selected,
        };
      });

      pathNames.value.push(list);
    }
    pathNames.value.push([
      {
        name: dashboard.name,
        selected: true,
      },
    ]);
  }

  async function getVersion() {
    const res = await appStore.fetchVersion();
    if (res.errors) {
      ElMessage.error(res.errors);
    }
  }

  function resetDuration() {
    const { duration }: Indexable = route.params;
    if (duration) {
      const d = JSON.parse(duration);

      appStore.updateDurationRow({
        start: new Date(d.start),
        end: new Date(d.end),
        step: d.step,
      });
      appStore.updateUTC(d.utc);
    }
  }

  function updateNavTitle() {
    const key = String(route.meta.i18nKey);
    pageTitle.value = te(key) ? t(key) : String(route.meta.title);
  }

  watch(
    () => [dashboardStore.currentDashboard, route.name],
    () => {
      getNavPaths();
    },
  );
</script>
<style lang="scss" scoped>
  .nav-bar {
    padding: 5px;
    text-align: left;
    justify-content: space-between;
    background-color: $theme-background;
    border-bottom: 1px solid $border-color;
    color: $font-color;
    font-size: $font-size-smaller;
  }

  .title {
    font-size: $font-size-normal;
    font-weight: 500;
    padding-top: 5px;
  }

  .nav-tabs {
    padding: 10px;
  }

  .name {
    display: inline-block;
    max-width: 250px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
</style>
