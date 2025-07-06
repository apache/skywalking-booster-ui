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
  store: {},
}));

// Mock components
vi.mock("@/components", () => ({}));
vi.mock("@/locales", () => ({}));

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
    (ElLoading.service as any).mockReturnValue(mockLoadingService);
    (createApp as any).mockReturnValue(mockApp);
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
    await import("../main");

    expect(createApp).toHaveBeenCalled();
  });

  it("should use required plugins", async () => {
    await import("../main");

    expect(mockApp.use).toHaveBeenCalledWith({}); // components
    expect(mockApp.use).toHaveBeenCalledWith({}); // i18n
    expect(mockApp.use).toHaveBeenCalledWith({}); // store
  });

  it("should call app store methods", async () => {
    const { useAppStoreWithOut } = await import("@/store/modules/app");
    const mockStore = useAppStoreWithOut();

    await import("../main");

    expect(mockStore.getActivateMenus).toHaveBeenCalled();
    expect(mockStore.queryOAPTimeInfo).toHaveBeenCalled();
  });

  it("should mount app after initialization", async () => {
    await import("../main");

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockApp.use).toHaveBeenCalledWith({}); // router
    expect(mockApp.mount).toHaveBeenCalledWith("#app");
  });

  it("should close loading service after mounting", async () => {
    await import("../main");

    // Wait for async operations
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockLoadingService.close).toHaveBeenCalled();
  });

  it("should handle async initialization properly", async () => {
    const { useAppStoreWithOut } = await import("@/store/modules/app");
    const mockStore = useAppStoreWithOut();

    // Mock async operations to take time
    mockStore.getActivateMenus.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    mockStore.queryOAPTimeInfo.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    await import("../main");

    // Wait for all async operations
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(mockStore.getActivateMenus).toHaveBeenCalled();
    expect(mockStore.queryOAPTimeInfo).toHaveBeenCalled();
    expect(mockApp.mount).toHaveBeenCalledWith("#app");
    expect(mockLoadingService.close).toHaveBeenCalled();
  });
});
