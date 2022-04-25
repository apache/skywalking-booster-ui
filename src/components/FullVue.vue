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
  <div ref="scrollWrapRef" class="scroll-snap-container">
    <div v-if="items.length > 1" class="scroll-handler__wrapper">
      <div
        @click="scrollToGraph(item.i)"
        v-for="item in items"
        :key="item.i"
        :class="[currentItem === `item${item.i}` ? 'active' : '']"
        class="full-scroll-to"
      ></div>
    </div>
    <div :id="'item' + item.i" class="item" v-for="item in items" :key="item.i">
      <slot v-if="items.length">
        <component :is="item.type" :data="item" />
      </slot>
    </div>
  </div>
</template>
<script lang="ts">
import { ref, watch, onMounted, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
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
    const { t } = useI18n();
    const p = useRoute().params;
    const currentItem = ref("");
    const scrollWrapRef = ref<any>(null);
    watch(
      () => dashboardStore.layout,
      () => {
        setTimeout(() => {
          observeItems();
        }, 500);
      }
    );
    function scrollToGraph(e: any) {
      document?.getElementById(`item${e}`)?.scrollIntoView();
    }
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
    function initScroller() {
      scrollWrapRef?.value?.addEventListener("scroll", (e: Event) => {
        const isBottom =
          scrollWrapRef?.value?.offsetHeight +
            scrollWrapRef?.value?.scrollTop +
            40 >
          scrollWrapRef?.value?.scrollHeight;

        if (isBottom) {
          scrollWrapRef?.value.scroll(0, 0);
        }        
      });
    }
    onMounted(() => {
      observeItems();
      initScroller();
    });
    return {
      t,
      dashboardStore,
      currentItem,
      scrollToGraph,
      scrollWrapRef,
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
  .scroll-handler__wrapper {
    z-index: 20;
    position: fixed;
    display: flex;
    flex-direction: column;
    right: 0;
    // top: 50%;
    transform: translateY(60%);
    height: auto;
    width: 20px;
    .full-scroll-to {
      opacity: 0.5;
      width: 10px;
      height: 10px;
      margin: 5px 0;
      border-radius: 50%;
      cursor: pointer;
      background: #4f4f4f;
    }
    .full-scroll-to.active {
      opacity: 1;
      padding: 6px;
      background: #252a2f;
    }
  }
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
