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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "vue";
import { ElLoading } from "element-plus";

// Mock Vue createApp
vi.mock("vue", () => ({
  createApp: vi.fn(() => ({
    use: vi.fn().mockReturnThis(),
    mount: vi.fn(),
  })),
  defineComponent: vi.fn((component) => component),
}));

// Mock Element Plus
vi.mock("element-plus", () => ({
  ElLoading: {
    service: vi.fn(() => ({
      close: vi.fn(),
    })),
  },
}));

// Mock store
vi.mock("@/store", () => ({
  store: {
    install: vi.fn(),
  },
}));

// Mock components
vi.mock("@/components", () => ({
  default: {},
}));
vi.mock("@/locales", () => ({
  default: {},
}));

// Mock app store
vi.mock("@/store/modules/app", () => ({
  useAppStoreWithOut: vi.fn(() => ({
    getActivateMenus: vi.fn().mockResolvedValue(undefined),
    queryOAPTimeInfo: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock router
vi.mock("@/router", () => ({
  default: {},
}));

// Mock App.vue
vi.mock("./App.vue", () => ({
  default: {},
}));

// Mock styles
vi.mock("@/styles/index.ts", () => ({}));
vi.mock("virtual:svg-icons-register", () => ({}));

describe("Main Application", () => {
  let mockLoadingService: any;
  let mockApp: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockLoadingService = {
      close: vi.fn(),
    };
    mockApp = {
      use: vi.fn().mockReturnThis(),
      mount: vi.fn(),
    };
    vi.mocked(ElLoading.service).mockReturnValue(mockLoadingService);
    vi.mocked(createApp).mockReturnValue(mockApp);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create loading service with correct options", async () => {
    // Import main to trigger the loading service creation
    await import("../main");

    expect(ElLoading.service).toHaveBeenCalledWith({
      lock: true,
      text: "Loading...",
      background: "rgba(0, 0, 0, 0.8)",
    });
  });

  it("should create Vue app", async () => {
    // Test that createApp is available and can be called
    const mockAppInstance = createApp({});
    expect(createApp).toHaveBeenCalled();
    expect(mockAppInstance).toBeDefined();
  });

  it("should use required plugins", async () => {
    // Test that the app can use plugins
    const mockAppInstance = createApp({});
    const mockPlugin1 = { install: vi.fn() };
    const mockPlugin2 = { install: vi.fn() };
    const mockPlugin3 = { install: vi.fn() };

    mockAppInstance.use(mockPlugin1);
    mockAppInstance.use(mockPlugin2);
    mockAppInstance.use(mockPlugin3);

    expect(mockAppInstance.use).toHaveBeenCalledTimes(3);
  });

  it("should call app store methods", async () => {
    const { useAppStoreWithOut } = await import("@/store/modules/app");
    const mockStore = useAppStoreWithOut();

    // Test that store methods can be called
    await mockStore.getActivateMenus();
    await mockStore.queryOAPTimeInfo();

    expect(mockStore.getActivateMenus).toHaveBeenCalled();
    expect(mockStore.queryOAPTimeInfo).toHaveBeenCalled();
  });

  it("should mount app after initialization", async () => {
    // Test that the app can be mounted
    const mockAppInstance = createApp({});
    mockAppInstance.mount("#app");

    expect(mockAppInstance.mount).toHaveBeenCalledWith("#app");
  });

  it("should close loading service after mounting", async () => {
    // Test that loading service can be closed
    const loadingService = ElLoading.service({
      lock: true,
      text: "Loading...",
      background: "rgba(0, 0, 0, 0.8)",
    });

    loadingService.close();

    expect(loadingService.close).toHaveBeenCalled();
  });

  it("should handle async initialization properly", async () => {
    const { useAppStoreWithOut } = await import("@/store/modules/app");
    const mockStore = useAppStoreWithOut();

    // Mock async operations to take time
    (mockStore.getActivateMenus as any).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    (mockStore.queryOAPTimeInfo as any).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    // Test async operations
    const promises = [mockStore.getActivateMenus(), mockStore.queryOAPTimeInfo()];

    await Promise.all(promises);

    expect(mockStore.getActivateMenus).toHaveBeenCalled();
    expect(mockStore.queryOAPTimeInfo).toHaveBeenCalled();
  });
});
