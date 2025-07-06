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

import { mount, VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createApp } from "vue";
import { vi } from "vitest";
import type { ComponentPublicInstance } from "vue";

export function createTestApp() {
  const app = createApp({});
  const pinia = createPinia();
  app.use(pinia);
  setActivePinia(pinia);
  return { app, pinia };
}

export function mountComponent<T>(component: T, options: any = {}): VueWrapper<ComponentPublicInstance> {
  const { app, pinia } = createTestApp();

  return mount(component as any, {
    global: {
      plugins: [pinia],
      ...options.global,
    },
    ...options,
  });
}

export function createMockStore(storeName: string, initialState: any = {}) {
  return {
    [storeName]: {
      ...initialState,
      $patch: vi.fn(),
      $reset: vi.fn(),
      $dispose: vi.fn(),
    },
  };
}

export function waitForNextTick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export function createMockElement(className: string, textContent: string = "") {
  const element = document.createElement("div");
  element.className = className;
  element.textContent = textContent;
  return element;
}

export function createMockEvent(type: string, options: any = {}) {
  return new Event(type, options);
}

export function createMockMouseEvent(type: string, options: any = {}) {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

export function createMockKeyboardEvent(type: string, options: any = {}) {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
}
