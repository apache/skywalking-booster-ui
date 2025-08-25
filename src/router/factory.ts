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

import type { AppRouteRecordRaw, RouteMeta } from "./types";
import { META_KEYS } from "./constants";

/**
 * Route factory for creating standardized routes
 */
export class RouteFactory {
  /**
   * Create a basic route
   */
  static createRoute(path: string, name: string, component: any, meta: Partial<RouteMeta> = {}): AppRouteRecordRaw {
    return {
      path,
      name,
      component,
      meta: {
        [META_KEYS.TITLE]: name,
        [META_KEYS.BREADCRUMB]: true,
        ...meta,
      },
    };
  }

  /**
   * Create a layout route with children
   */
  static createLayoutRoute(
    name: string,
    component: any,
    children: AppRouteRecordRaw[],
    meta: Partial<RouteMeta> = {},
  ): AppRouteRecordRaw {
    return {
      path: "",
      name,
      component,
      meta: {
        [META_KEYS.TITLE]: name,
        [META_KEYS.BREADCRUMB]: true,
        ...meta,
      },
      children,
    };
  }

  /**
   * Create a redirect route
   */
  static createRedirectRoute(
    name: string,
    redirectPath: string,
    component: any,
    children: AppRouteRecordRaw[] = [],
    meta: Partial<RouteMeta> = {},
  ): AppRouteRecordRaw {
    return {
      path: "",
      name,
      redirect: redirectPath,
      component,
      meta: {
        [META_KEYS.NOT_SHOW]: true,
        ...meta,
      },
      children,
    };
  }

  /**
   * Create a lazy-loaded component route
   */
  static createLazyRoute(
    path: string,
    name: string,
    importFn: () => Promise<any>,
    meta: Partial<RouteMeta> = {},
  ): AppRouteRecordRaw {
    return this.createRoute(path, name, importFn, meta);
  }

  /**
   * Create a tab route for active tab index
   */
  static createTabRoute(
    basePath: string,
    name: string,
    component: any,
    meta: Partial<RouteMeta> = {},
  ): AppRouteRecordRaw {
    return this.createRoute(`/${basePath}/tab/:activeTabIndex`, `${name}ActiveTabIndex`, component, {
      [META_KEYS.NOT_SHOW]: true,
      [META_KEYS.BREADCRUMB]: false,
      ...meta,
    });
  }

  /**
   * Create a parameterized route
   */
  static createParamRoute(
    path: string,
    name: string,
    component: any,
    meta: Partial<RouteMeta> = {},
  ): AppRouteRecordRaw {
    return this.createRoute(path, name, component, {
      [META_KEYS.BREADCRUMB]: true,
      ...meta,
    });
  }
}

/**
 * Helper functions for common route patterns
 */
export const RouteHelpers = {
  /**
   * Create dashboard-related routes
   */
  createDashboardRoutes: (basePath: string, component: any) => [
    RouteFactory.createParamRoute(`/${basePath}`, `Dashboard${basePath}`, component, {
      [META_KEYS.TITLE]: `${basePath} Dashboard`,
    }),
    RouteFactory.createTabRoute(basePath, `Dashboard${basePath}`, component, {
      [META_KEYS.TITLE]: `${basePath} Dashboard`,
    }),
  ],

  /**
   * Create service relation routes
   */
  createServiceRelationRoutes: (component: any) => [
    RouteFactory.createParamRoute(
      "/dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
      "DashboardViewServiceRelation",
      component,
      { [META_KEYS.TITLE]: "Service Relations" },
    ),
    RouteFactory.createTabRoute(
      "dashboard/related/:layerId/:entity/:serviceId/:destServiceId/:name",
      "DashboardViewServiceRelation",
      component,
      { [META_KEYS.TITLE]: "Service Relations" },
    ),
  ],
};
