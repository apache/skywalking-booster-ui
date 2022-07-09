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
        :id="'scroll' + item.i"
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
import { ref, watch, onMounted, onBeforeUnmount, defineComponent } from "vue";
import { useI18n } from "vue-i18n";
import { useDashboardStore } from "@/store/modules/dashboard";
import Configuration from "../views/dashboard/configuration";
import controls from "../views/dashboard/controls/index";
import { useRoute } from "vue-router";
import connect from "../hooks/useIDE";

let isScrolling = false;
function scrollStop(callback: { (): void; (): void }, refresh = 66) {
  let scrollListener: number;
  window.addEventListener(
    "scroll",
    function () {
      isScrolling = true;
      window.clearTimeout(scrollListener);
      scrollListener = window.setTimeout(callback, refresh);
    },
    true
  );
}
scrollStop(function () {
  isScrolling = false;
});

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
    const arrayOfItems = ref<Element[]>([]);
    const currentItem = ref<number>(0);
    const scrollWrapRef = ref<any>(null);
    const { path, query } = useRoute();
    watch(
      () => dashboardStore.layout,
      () => {
        setTimeout(() => {
          observeItems();
        }, 500);
      }
    );
    function scrollToGraph(e: any, index: number) {
      isScrolling = true;
      let el = document.getElementById(`item${e}`);

      if (el != null) {
        el.scrollIntoView();
        currentItem.value = index;
      }
    }
    function observeItems() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((element) => {
          if (element.intersectionRatio > 0) {
            // currentItem.value = element.target.id;
          }
        });
      });
      document.querySelectorAll(".item").forEach((element) => {
        arrayOfItems.value.push(element);
        observer.observe(element);
      });
    }
    function scrollTo(index: number) {
      let scrollIndex = arrayOfItems.value[index];
      if (scrollIndex) {
        let el = document.getElementById(`scroll${scrollIndex.id.substr(4)}`);
        if (el != null) {
          el.click();
        }
      }
    }
    function scrollUp() {
      if (currentItem.value > 0) {
        currentItem.value--;
        scrollTo(currentItem.value);
      }
    }
    function scrollDown() {
      if (currentItem.value < arrayOfItems?.value?.length - 1) {
        currentItem.value++;
        scrollTo(currentItem.value);
      } else if (currentItem.value === arrayOfItems?.value?.length - 1) {
        currentItem.value = 0;
        scrollTo(currentItem.value);
      }
    }
    function wheelGraphScroll(e: WheelEvent) {
      e.preventDefault();
      if (!isScrolling) {
        if (e.deltaY < 0) {
          scrollUp();
        } else {
          scrollDown();
        }
      }
    }
    function keyGraphScroll(e: KeyboardEvent) {
      if (e.keyCode == 38) {
        e.preventDefault();
        scrollUp();
      } else if (e.keyCode === 40) {
        e.preventDefault();
        scrollDown();
      }
    }
    function initScroller() {
      //todo: smarter logic on when to add listeners
      if (query["portal"] === "true" && path.endsWith("Activity")) {
        console.log("Adding portal wheel/key listeners");
        scrollWrapRef?.value?.addEventListener("wheel", wheelGraphScroll, {
          passive: false,
        });
        document.addEventListener("keydown", keyGraphScroll, {
          passive: false,
        });
      }
    }
    onMounted(() => {
      observeItems();
      initScroller();

      if (query["portal"] === "true") {
        connect();
      }
    });
    onBeforeUnmount(() => {
      scrollWrapRef?.value?.removeEventListener("wheel", wheelGraphScroll);
      document.removeEventListener("keydown", keyGraphScroll);
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
    top: 37vh;
    height: auto;
    width: 17px;

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
      background: #1a1a1a;
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
