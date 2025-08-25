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

import type { NavigationGuard } from "./types";
import { getDefaultRoute } from "./utils";
import { ROUTE_PATHS } from "./constants";

/**
 * Global navigation guard for handling root path redirects
 */
export function createRootGuard(routes: any[]) {
  return function rootGuard(to: any, from: any, next: any) {
    if (to.path === ROUTE_PATHS.ROOT) {
      const defaultPath = getDefaultRoute(routes);
      next({ path: defaultPath });
    } else {
      next();
    }
  };
}

/**
 * Authentication guard (placeholder for future implementation)
 */
export function createAuthGuard() {
  return function authGuard(to: any, from: any, next: any) {
    // TODO: Implement authentication logic
    // const token = window.localStorage.getItem("skywalking-authority");
    // if (to.meta?.requiresAuth && !token) {
    //   next('/login');
    //   return;
    // }
    next();
  };
}

/**
 * Route validation guard
 */
export function createValidationGuard() {
  return function validationGuard(to: any, from: any, next: any) {
    // Validate route parameters if needed
    if (to.params && Object.keys(to.params).length > 0) {
      // Add custom validation logic here
      const hasValidParams = Object.values(to.params).every(
        (param) => param !== undefined && param !== null && param !== "",
      );

      if (!hasValidParams) {
        next({ name: "NotFound" });
        return;
      }
    }

    next();
  };
}

/**
 * Error handling guard
 */
export function createErrorGuard() {
  return function errorGuard(error: any) {
    console.error("Router error:", error);

    // Handle specific error types
    if (error.name === "NavigationDuplicated") {
      // Ignore duplicate navigation errors
      return;
    }

    // Redirect to error page or handle other errors
    throw error;
  };
}

/**
 * Apply all navigation guards
 */
export function applyGuards(router: any, routes: any[]) {
  router.beforeEach(createRootGuard(routes));
  router.beforeEach(createAuthGuard());
  router.beforeEach(createValidationGuard());
  router.onError(createErrorGuard());
}
