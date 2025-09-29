/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ref, computed } from "vue";
import { Themes } from "@/constants/data";
import { useAppStoreWithOut } from "@/store/modules/app";

export function useTheme() {
  const appStore = useAppStoreWithOut();
  const theme = ref<boolean>(true);
  const themeSwitchRef = ref<HTMLElement>();

  // Initialize theme from localStorage or system preference
  function initializeTheme() {
    const savedTheme = window.localStorage.getItem("theme-is-dark");
    let isDark = true; // default to dark theme

    if (savedTheme === "false") {
      isDark = false;
    } else if (savedTheme === "") {
      // read the theme preference from system setting if there is no user setting
      isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    theme.value = isDark;
    applyTheme();
  }

  // Apply theme to DOM and store
  function applyTheme() {
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

  // Handle theme change with transition animation
  function handleChangeTheme() {
    const x = themeSwitchRef.value?.offsetLeft ?? 0;
    const y = themeSwitchRef.value?.offsetTop ?? 0;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    // compatibility handling
    if (!document.startViewTransition) {
      applyTheme();
      return;
    }

    // api: https://developer.chrome.com/docs/web-platform/view-transitions
    const transition = document.startViewTransition(() => {
      applyTheme();
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

  // Computed properties
  const isDark = computed(() => theme.value);
  const isLight = computed(() => !theme.value);

  return {
    theme,
    themeSwitchRef,
    isDark,
    isLight,
    initializeTheme,
    applyTheme,
    handleChangeTheme,
  };
}
