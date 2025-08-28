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

/**
 * Route validation errors
 */
export interface RouteValidationError {
  routeName: string;
  path: string;
  error: string;
  type: "error" | "warning";
}

/**
 * Route configuration validator
 */
export class RouteValidator {
  private errors: RouteValidationError[] = [];
  private routeNames = new Set<string>();
  private routePaths = new Set<string>();

  /**
   * Validate all routes
   */
  validateRoutes(routes: AppRouteRecordRaw[]): RouteValidationError[] {
    this.errors = [];
    this.routeNames.clear();
    this.routePaths.clear();

    routes.forEach((route) => this.validateRoute(route));

    return this.errors;
  }

  /**
   * Validate a single route
   */
  private validateRoute(route: AppRouteRecordRaw, parentPath = ""): void {
    const fullPath = parentPath + route.path;

    // Validate required fields
    this.validateRequiredFields(route, fullPath);

    // Validate uniqueness
    this.validateUniqueness(route, fullPath);

    // Validate children
    if (route.children) {
      route.children.forEach((child) => this.validateRoute(child, fullPath));
    }
  }

  /**
   * Validate required fields
   */
  private validateRequiredFields(route: AppRouteRecordRaw, fullPath: string): void {
    if (!route.name) {
      this.addError(route, fullPath, "Route name is required", "error");
    }

    if (!route.component) {
      this.addError(route, fullPath, "Route component is required", "error");
    }

    if (route.path === undefined || route.path === null) {
      this.addError(route, fullPath, "Route path is required", "error");
    }

    // Allow empty paths for layout routes (routes with children)
    if (route.path === "" && !route.children) {
      this.addError(route, fullPath, "Route path cannot be empty unless it has children", "error");
    }
  }

  /**
   * Validate uniqueness
   */
  private validateUniqueness(route: AppRouteRecordRaw, fullPath: string): void {
    if (route.name) {
      if (this.routeNames.has(route.name.toString())) {
        this.addError(route, fullPath, `Duplicate route name: ${route.name.toString()}`, "error");
      } else {
        this.routeNames.add(route.name.toString());
      }
    }

    if (route.path && route.path !== "") {
      if (this.routePaths.has(fullPath)) {
        this.addError(route, fullPath, `Duplicate route path: ${fullPath}`, "error");
      } else {
        this.routePaths.add(fullPath);
      }
    }
  }

  /**
   * Add validation error
   */
  private addError(route: AppRouteRecordRaw, path: string, error: string, type: "error" | "warning"): void {
    this.errors.push({
      routeName: route.name?.toString() || "unnamed",
      path,
      error,
      type,
    });
  }

  /**
   * Check if routes are valid
   */
  isValid(routes: AppRouteRecordRaw[]): boolean {
    const errors = this.validateRoutes(routes);
    return errors.filter((e) => e.type === "error").length === 0;
  }

  /**
   * Get validation summary
   */
  getValidationSummary(routes: AppRouteRecordRaw[]): {
    total: number;
    errors: number;
    warnings: number;
    isValid: boolean;
  } {
    const errors = this.validateRoutes(routes);
    const errorCount = errors.filter((e) => e.type === "error").length;
    const warningCount = errors.filter((e) => e.type === "warning").length;

    return {
      total: routes.length,
      errors: errorCount,
      warnings: warningCount,
      isValid: errorCount === 0,
    };
  }
}

/**
 * Route configuration analyzer
 */
export class RouteAnalyzer {
  /**
   * Analyze route structure
   */
  static analyzeRoutes(routes: AppRouteRecordRaw[]): {
    totalRoutes: number;
    nestedRoutes: number;
    lazyRoutes: number;
    redirectRoutes: number;
    depth: number;
  } {
    let totalRoutes = 0;
    let nestedRoutes = 0;
    let lazyRoutes = 0;
    let redirectRoutes = 0;
    let maxDepth = 0;

    const analyzeRoute = (route: AppRouteRecordRaw, depth = 0) => {
      totalRoutes++;
      maxDepth = Math.max(maxDepth, depth);

      if (route.redirect) {
        redirectRoutes++;
      }

      if (typeof route.component === "function") {
        lazyRoutes++;
      }

      if (route.children && route.children.length > 0) {
        nestedRoutes++;
        route.children.forEach((child) => analyzeRoute(child, depth + 1));
      }
    };

    routes.forEach((route) => analyzeRoute(route));

    return {
      totalRoutes,
      nestedRoutes,
      lazyRoutes,
      redirectRoutes,
      depth: maxDepth,
    };
  }

  /**
   * Find routes by metadata
   */
  static findRoutesByMeta(routes: AppRouteRecordRaw[], metaKey: string, metaValue: any): AppRouteRecordRaw[] {
    const found: AppRouteRecordRaw[] = [];

    const searchRoute = (route: AppRouteRecordRaw) => {
      if (route.meta && (route.meta as any)[metaKey] === metaValue) {
        found.push(route);
      }

      if (route.children) {
        route.children.forEach(searchRoute);
      }
    };

    routes.forEach(searchRoute);
    return found;
  }
}
