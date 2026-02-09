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

import { config } from "@vue/test-utils";
import { vi, beforeAll, afterAll } from "vitest";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
} as any;

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  const id = setTimeout(cb, 0);
  return id as unknown as number;
});
globalThis.cancelAnimationFrame = vi.fn();

// Configure Vue Test Utils
config.global.plugins = [ElementPlus];

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});
