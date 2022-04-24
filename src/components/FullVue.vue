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
  <div class="scroll-snap-container">
    <div :id="'item' + item.i" class="item" v-for="item in items" :key="item.i">    
      <slot v-if="items.length">
        <component :is="item.type" :data="item" />
      </slot>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, watch, reactive, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
// import { useAppStoreWithOut } from "@/store/modules/app";
import Configuration from "../views/dashboard/configuration";
import controls from "../views/dashboard/controls/index";

export default defineComponent({
  name: "Dashboard",
  props: {
    items: {
      type: Array,
      default: () => [],
    },
  },
  components: { ...Configuration, ...controls },
  setup() {
    const dashboardStore = useDashboardStore();
    const tobewatched = reactive(dashboardStore);
    // const appStore = useAppStoreWithOut();
    const { t } = useI18n();
    const p = useRoute().params;
    // const layoutKey = ref<string>(`${p.layerId}_${p.entity}_${p.name}`);
    // setTemplate();
    const currentItem = ref("");
    watch(
      () => tobewatched.layout,
      () => {
        setTimeout(() => {
          observeItems();
        }, 500);
      }
    );

    // async function setTemplate() {
    //   await dashboardStore.setDashboards();

    //   if (!p.entity) {
    //     if (!dashboardStore.currentDashboard) {
    //       return;
    //     }
    //     const { layer, entity, name } = dashboardStore.currentDashboard;
    //     layoutKey.value = `${layer}_${entity}_${name}`;
    //   }
    //   const c: { configuration: string; id: string } = JSON.parse(
    //     sessionStorage.getItem(layoutKey.value) || "{}"
    //   );
    //   const layout: any = c.configuration || {};
    //   dashboardStore.setLayout(layout.children || []);
    //   appStore.setPageTitle(layout.name);

    //   // observeItems();

    //   if (p.entity) {
    //     dashboardStore.setCurrentDashboard({
    //       layer: p.layerId,
    //       entity: p.entity,
    //       name: p.name,
    //       id: c.id,
    //       isRoot: layout.isRoot,
    //     });
    //   }
    // }
    function observeItems() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((element) => {
          if (element.intersectionRatio > 0) {
            currentItem.value = element.target.id;
          }
        });
      });
      document.querySelectorAll(".item").forEach((element) => {
        observer.observe(element);
      });
    }
    return {
      t,
      dashboardStore,
      currentItem,
    };
  },
});
</script>

<style lang="scss" scoped>
.scroll-snap-container {
  height: 90vh;
  display: block;
  overflow-y: scroll;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scroll-snap-points-y: repeat(100%);
  scroll-snap-destination: 0 0;
  scroll-snap-type: y mandatory;
  scroll-snap-type: mandatory;
  scroll-behavior: smooth;
}
.scroll-snap-container::-webkit-scrollbar {
  display: none;
}
.item {
  scroll-snap-align: start;
  height: 100%;
  padding: 40px;
  margin: 40px 0;
  // background: orange;
}
</style>
