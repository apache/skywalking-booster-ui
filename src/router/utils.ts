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

import type { AppRouteRecordRaw } from "./types";
import { DEFAULT_ROUTE } from "./constants";

/**
 * Find the first activated route from a list of routes
 */
export function findActivatedRoute(routes: AppRouteRecordRaw[]): string | null {
  for (const route of routes) {
    if (route.children) {
      for (const child of route.children) {
        if (child.meta?.activate) {
          return child.path;
        }
      }
    }
  }
  return null;
}

/**
 * Get default route path
 */
export function getDefaultRoute(routes: AppRouteRecordRaw[]): string {
  const activatedRoute = findActivatedRoute(routes);
  return activatedRoute || DEFAULT_ROUTE;
}

/**
 * Check if route requires authentication
 */
export function requiresAuth(route: AppRouteRecordRaw): boolean {
  return route.meta?.requiresAuth === true;
}

/**
 * Generate breadcrumb data from route
 */
export function generateBreadcrumb(route: AppRouteRecordRaw): string[] {
  const breadcrumbs: string[] = [];

  if (route.meta?.title) {
    breadcrumbs.push(route.meta.title);
  }

  if (route.children) {
    route.children.forEach((child) => {
      if (child.meta?.breadcrumb !== false && child.meta?.title) {
        breadcrumbs.push(child.meta.title);
      }
    });
  }

  return breadcrumbs;
}

/**
 * Validate route configuration
 */
export function validateRoute(route: AppRouteRecordRaw): boolean {
  if (!route.path || !route.name) {
    return false;
  }

  if (route.children) {
    return route.children.every((child) => validateRoute(child));
  }

  return true;
}

/**
 * Flatten nested routes for easier processing
 */
export function flattenRoutes(routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] {
  const flattened: AppRouteRecordRaw[] = [];

  routes.forEach((route) => {
    flattened.push(route);
    if (route.children) {
      flattened.push(...flattenRoutes(route.children));
    }
  });

  return flattened;
}
