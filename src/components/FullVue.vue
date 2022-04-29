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
        @click="scrollToGraph(item.i, index)"
        v-for="(item, index) in items"
        :key="item.i"
        :class="[currentItem === index ? 'active' : '']"
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
import * as $ from "jquery";
import { ref, watch, onMounted, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useDashboardStore } from "@/store/modules/dashboard";
import Configuration from "../views/dashboard/configuration";
import controls from "../views/dashboard/controls/index";

export default defineComponent({
  name: "FullView",
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
    const arrayOfItems = ref<Element[]>([]);
    const currentItem = ref<number>(0);
    const scrollWrapRef = ref<any>(null);
    const isScrolling = ref(false);
    watch(
      () => dashboardStore.layout,
      () => {
        setTimeout(() => {
          observeItems();
        }, 500);
      }
    );
    function scrollToGraph(e: any, index: number) {
      document?.getElementById(`item${e}`)?.scrollIntoView();
      currentItem.value = index;
    }
    function observeItems() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((element) => {
          if (element.intersectionRatio > 0) {
            // currentItem.value = element.target.id;
          }
        });
      });
      document.querySelectorAll(".item").forEach((element, index) => {
        arrayOfItems.value.push(element);
        observer.observe(element);
      });
    }
    function scrollTo(index: number) {
      arrayOfItems.value[index]?.scrollIntoView();
      if (isScrolling.value) {
        setTimeout(() => {
          isScrolling.value = false;
        }, 1020);
      }
    }
    function scrollUp() {
      if (currentItem.value > 0) {
        currentItem.value--;
        scrollTo(currentItem.value);
      } else if (currentItem.value === 0) {
        isScrolling.value = false;
      }
    }
    function scrollDown() {
      if (currentItem.value < arrayOfItems?.value?.length - 1) {
        currentItem.value++;
        scrollTo(currentItem.value);
      } else if (currentItem.value === arrayOfItems?.value?.length - 1) {
        isScrolling.value = true;
        currentItem.value = 0;
        scrollTo(currentItem.value);
      }
    }
    function initScroller() {
      scrollWrapRef?.value?.addEventListener("wheel", (e: WheelEvent) => {
        if (isScrolling.value === false) {
          isScrolling.value = true;
          if (e.deltaY < 0) {
            scrollUp();
          } else {
            scrollDown();
          }
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
  scroll-behavior: smooth;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  perspective: 1000;
  overflow: hidden;

  .scroll-handler__wrapper {
    z-index: 20;
    position: fixed;
    display: flex;
    flex-direction: column;
    right: 0;
    // top: 50%;
    //transform: translateY(60%);
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
  // scroll-snap-align: start;
  height: 100%;
  // padding: 40px;
  // margin: 40px 0;
  // background: orange;
}
</style>
