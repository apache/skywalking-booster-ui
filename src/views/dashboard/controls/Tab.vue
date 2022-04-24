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
  <div ref="tabRef" class="flex-h tab-header">
    <div class="tabs">
      <span
        v-for="(child, idx) in data.children || []"
        :key="idx"
        :class="{ active: activeTabIndex === idx }"
        @click="clickTabs($event, idx)"
      >
        <input
          @click="editTabName($event, idx)"
          v-model="child.name"
          placeholder="Please input"
          class="tab-name"
          :readonly="isNaN(editTabIndex)"
          :class="{ view: isNaN(editTabIndex) }"
        />
        <Icon
          v-show="activeTabIndex === idx"
          size="sm"
          iconName="cancel"
          @click="deleteTabItem($event, idx)"
          v-if="dashboardStore.editMode"
        />
      </span>
      <span class="tab-icons" v-if="dashboardStore.editMode">
        <el-tooltip content="Add tab items" placement="bottom">
          <i @click="addTabItem">
            <Icon size="middle" iconName="add" />
          </i>
        </el-tooltip>
      </span>
    </div>
    <div class="operations" v-if="dashboardStore.editMode">
      <el-popover
        placement="bottom"
        trigger="click"
        :width="200"
        v-model:visible="showTools"
      >
        <template #reference>
          <span>
            <Icon
              iconName="ellipsis_v"
              size="middle"
              class="operation"
              @click="showTools = true"
            />
          </span>
        </template>
        <div
          class="tools"
          @click="
            canEditTabName = true;
            showTools = false;
          "
        >
          <span class="edit-tab">{{ t("editTab") }}</span>
        </div>
        <div class="tools" @click="removeTab">
          <span>{{ t("delete") }}</span>
        </div>
      </el-popover>
    </div>
  </div>
  <div class="tab-layout" @click="handleClick">
    <grid-layout
      v-if="dashboardStore.currentTabItems.length"
      v-model:layout="dashboardStore.currentTabItems"
      :col-num="24"
      :row-height="10"
      :is-draggable="dashboardStore.editMode"
      :is-resizable="dashboardStore.editMode"
      @layout-updated="layoutUpdatedEvent"
    >
      <div
        ref="tabObserveContainer"
        class="scroll-snap-container"
        v-if="dashboardStore.fullView"
      >
        <div
          v-if="dashboardStore.currentTabItems.length > 1"
          class="scroll-handler__wrapper"
        >
          <div
            @click="scrollToGraph(item.i)"
            v-for="item in dashboardStore.currentTabItems"
            :key="item.i"
            :class="[currentItem === `tabitem${item.i}` ? 'active' : '']"
            class="scroll-to"
          ></div>
        </div>
        <div
          class="tabitem"
          :id="`tabitem${item.i}`"
          v-for="item in dashboardStore.currentTabItems"
          :key="item.i"
        >
          <component
            :is="item.type"
            :data="item"
            :activeIndex="`${data.i}-${activeTabIndex}-${item.i}`"
            :needQuery="needQuery"
            @click="clickTabGrid($event, item)"
            :class="{ active: activeTabWidget === item.i }"
          />
        </div>
      </div>

      <template v-else>
        <grid-item
          v-for="item in dashboardStore.currentTabItems"
          :x="item.x"
          :y="item.y"
          :w="item.w"
          :h="item.h"
          :i="item.i"
          :key="item.i"
          @click="clickTabGrid($event, item)"
          :class="{ active: activeTabWidget === item.i }"
          drag-ignore-from="svg.d3-trace-tree, .dragger, .micro-topo-chart"
        >
          <component
            :is="item.type"
            :data="item"
            :activeIndex="`${data.i}-${activeTabIndex}-${item.i}`"
            :needQuery="needQuery"
          />
        </grid-item>
      </template>
    </grid-layout>
    <div class="no-data-tips" v-else>{{ t("noWidget") }}</div>
  </div>
</template>
<script lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  defineComponent,
  toRefs,
} from "vue";
import { useI18n } from "vue-i18n";
import type { PropType } from "vue";
import { LayoutConfig } from "@/types/dashboard";
import { useDashboardStore } from "@/store/modules/dashboard";
import Topology from "./Topology.vue";
import Widget from "./Widget.vue";
import Trace from "./Trace.vue";
import Profile from "./Profile.vue";
import Log from "./Log.vue";
import Text from "./Text.vue";

const props = {
  data: {
    type: Object as PropType<LayoutConfig>,
    default: () => ({ children: [] }),
  },
  active: { type: Boolean, default: false },
};
export default defineComponent({
  name: "Tab",
  components: { Topology, Widget, Trace, Profile, Log, Text },
  props,
  setup(props) {
    const { t } = useI18n();
    const dashboardStore = useDashboardStore();
    const activeTabIndex = ref<number>(0);
    const activeTabWidget = ref<string>("");
    const editTabIndex = ref<number>(NaN); // edit tab item name
    const canEditTabName = ref<boolean>(false);
    const needQuery = ref<boolean>(false);
    const showTools = ref<boolean>(false);
    const tabRef = ref<any>("");
    const tabObserveContainer = ref<any>(null);
    const currentItem = ref("");
    const l = dashboardStore.layout.findIndex(
      (d: LayoutConfig) => d.i === props.data.i
    );
    if (dashboardStore.layout[l].children.length) {
      dashboardStore.setCurrentTabItems(
        dashboardStore.layout[l].children[activeTabIndex.value].children
      );
      dashboardStore.setActiveTabIndex(activeTabIndex.value, props.data.i);
      setTimeout(() => {
        observeItems();
      }, 1500);
    }
    function scrollToGraph(e: any) {
      document?.getElementById(`tabitem${e}`)?.scrollIntoView();
    }

    function observeItems(kill = false) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(
          (element) => {
            if (element.isIntersecting && element.intersectionRatio > 0) {
              setTimeout(() => {
                currentItem.value = element.target.id;
              }, 200);
            }
          },
          {
            // rootMargin: "-60px 0",
            // container: tabObserveContainer.value
          }
        );
      });
      document.querySelectorAll(".tabitem").forEach((element) => {
        observer.observe(element);
      });
      if (kill) {
        document.querySelectorAll(".tabitem").forEach((element) => {
        observer.unobserve(element);
      });
      }
    }

    watch(
      () => dashboardStore.currentTabItems,
      () => {
        setTimeout(() => {
          observeItems();
        }, 500);
      }
    );

    function clickTabs(e: Event, idx: number) {
      e.stopPropagation();
      activeTabIndex.value = idx;
      dashboardStore.activeGridItem(props.data.i);
      dashboardStore.selectWidget(props.data);
      dashboardStore.setActiveTabIndex(idx);
      const l = dashboardStore.layout.findIndex(
        (d: LayoutConfig) => d.i === props.data.i
      );
      dashboardStore.setCurrentTabItems(
        dashboardStore.layout[l].children[activeTabIndex.value].children
      );
      needQuery.value = true;
    }
    function removeTab(e: Event) {
      e.stopPropagation();
      dashboardStore.removeTab(props.data);
    }
    function deleteTabItem(e: Event, idx: number) {
      e.stopPropagation();
      dashboardStore.removeTabItem(props.data, idx);
      const kids = dashboardStore.layout[l].children[0];
      const arr = (kids && kids.children) || [];
      dashboardStore.setCurrentTabItems(arr);
      dashboardStore.activeGridItem(0);
      activeTabIndex.value = 0;
      needQuery.value = true;
    }
    function addTabItem() {
      dashboardStore.addTabItem(props.data);
    }
    function editTabName(el: Event, index: number) {
      if (!canEditTabName.value) {
        editTabIndex.value = NaN;
        return;
      }
      editTabIndex.value = index;
    }
    function handleClick(el: any) {
      if (["tab-name", "edit-tab"].includes(el.target.className)) {
        return;
      }
      canEditTabName.value = false;
      editTabIndex.value = NaN;
    }
    function clickTabGrid(e: Event, item: LayoutConfig) {
      e.stopPropagation();
      activeTabWidget.value = item.i;
      dashboardStore.activeGridItem(
        `${props.data.i}-${activeTabIndex.value}-${item.i}`
      );
      handleClick(e);
    }
    function layoutUpdatedEvent() {
      const l = dashboardStore.layout.findIndex(
        (d: LayoutConfig) => d.i === props.data.i
      );
      dashboardStore.setCurrentTabItems(
        dashboardStore.layout[l].children[activeTabIndex.value].children
      );
    }
    document.body.addEventListener("click", handleClick, false);
    watch(
      () => dashboardStore.activedGridItem,
      (data) => {
        if (!data) {
          activeTabWidget.value = "";
          return;
        }
        const i = data.split("-");
        if (i[0] === props.data.i && activeTabIndex.value === Number(i[1])) {
          activeTabWidget.value = i[2];
        } else {
          activeTabWidget.value = "";
        }
      }
    );
    onMounted(() => {
      tabRef?.value["parentElement"]?.classList?.toggle("item");
      if (dashboardStore.fullView) {
        console.log("Tab Osbercve:", tabObserveContainer);
      }
    });
    onBeforeUnmount(() => {
      observeItems(true);
    });
    return {
      currentItem,
      tabObserveContainer,
      scrollToGraph,
      handleClick,
      layoutUpdatedEvent,
      clickTabGrid,
      editTabName,
      addTabItem,
      deleteTabItem,
      removeTab,
      clickTabs,
      ...toRefs(props),
      tabRef,
      activeTabWidget,
      dashboardStore,
      activeTabIndex,
      editTabIndex,
      needQuery,
      canEditTabName,
      showTools,
      t,
    };
  },
});
</script>
<style lang="scss" scoped>
.tab-layout::-webkit-scrollbar {
  display: none !important;
}
.scroll-snap-container {
  position: relative;
  height: 80vh;
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
.tabitem {
  scroll-snap-align: start;
  height: 100%;
  margin: 70px 0;
}
.scroll-handler__wrapper {
  z-index: 20;
  position: fixed;
  display: flex;
  flex-direction: column;
  right: 0;
  top: 40vh;
  height: auto;
  width: 20px;
  .scroll-to {
    opacity: 0.5;
    width: 10px;
    height: 10px;
    margin: 5px 0;
    border-radius: 50%;
    cursor: pointer;
    background: #4f4f4f;
  }
  .scroll-to.active {
    opacity: 1;
    padding: 6px;
    background: #252a2f;
  }
}
.tabs {
  height: 40px;
  color: #ccc;

  span {
    display: inline-block;
    padding: 0 10px;
    margin: 0 10px;
    height: 40px;
    line-height: 40px;
    cursor: pointer;
  }

  .tab-name {
    max-width: 130px;
    height: 20px;
    line-height: 20px;
    outline: none;
    color: #333;
    font-style: normal;
    margin-right: 5px;
  }

  .tab-icons {
    color: #333;

    i {
      margin-right: 3px;
    }
  }

  .view {
    cursor: pointer;
  }

  input.tab-name {
    border: 0;
  }

  span.active {
    border-bottom: 1px solid #409eff;
    color: #409eff;
  }
}

.operations {
  color: #aaa;
  cursor: pointer;
  height: 40px;
  line-height: 40px;
  padding-right: 10px;
}

.tab-header {
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid #eee;
}

.vue-grid-layout {
  background: #f7f9fa;
  height: auto !important;
}

.vue-grid-item:not(.vue-grid-placeholder) {
  background: #fff;
  box-shadow: 0px 1px 4px 0px #00000029;
  border-radius: 3px;
}

.tab-layout {
  height: calc(100% - 55px);
  overflow: auto;
}

.vue-grid-item.active {
  border: 1px solid #409eff;
}

.no-data-tips {
  width: 100%;
  text-align: center;
  font-size: 14px;
  padding-top: 30px;
  color: #888;
}

.tools {
  padding: 5px 0;
  color: #999;
  cursor: pointer;
  position: relative;
  text-align: center;

  &:hover {
    color: #409eff;
    background-color: #eee;
  }
}
</style>
