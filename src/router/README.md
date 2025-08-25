# Router Architecture Documentation

This directory contains the refactored and optimized router configuration for the Apache SkyWalking Booster UI.

## Architecture Overview

The router system has been refactored to provide:

- **Type Safety**: Full TypeScript support with custom route types
- **Modularity**: Separated concerns with dedicated files for different aspects
- **Maintainability**: Centralized constants and utilities
- **Performance**: Lazy loading for route components
- **Validation**: Route configuration validation and analysis
- **Extensibility**: Factory pattern for creating routes

## File Structure

```
src/router/
├── index.ts              # Main router configuration
├── index-utils.ts        # Exports all utilities and types
├── types.ts              # TypeScript interfaces and types
├── constants.ts          # Route constants and paths
├── utils.ts              # Utility functions
├── guards.ts             # Navigation guards
├── factory.ts            # Route factory utilities
├── validator.ts          # Route validation
├── dashboard.ts          # Dashboard routes
├── marketplace.ts        # Marketplace routes
├── alarm.ts              # Alarm routes
├── settings.ts           # Settings routes
├── layer.ts              # Layer routes
├── notFound.ts           # 404 routes
└── README.md             # This documentation
```

## Key Features

### 1. Type Safety

All routes use the `AppRouteRecordRaw` interface which extends Vue Router's `RouteRecordRaw` with custom metadata:

```typescript
interface RouteMeta {
  title?: string;
  i18nKey?: string;
  icon?: string;
  hasGroup?: boolean;
  activate?: boolean;
  descKey?: string;
  layer?: string;
  notShow?: boolean;
  requiresAuth?: boolean;
  breadcrumb?: boolean;
}
```

### 2. Constants

Centralized route constants for consistency:

```typescript
export const ROUTE_PATHS = {
  ROOT: '/',
  MARKETPLACE: '/marketplace',
  DASHBOARD: {
    LIST: '/dashboard/list',
    NEW: '/dashboard/new',
    // ... more paths
  },
} as const;
```

### 3. Lazy Loading

Components are lazy-loaded for better performance:

```typescript
const List = () => import("@/views/dashboard/List.vue");
const New = () => import("@/views/dashboard/New.vue");
```

### 4. Navigation Guards

Centralized guard management:

```typescript
// Root path redirect
createRootGuard(routes)

// Authentication (placeholder)
createAuthGuard()

// Route validation
createValidationGuard()

// Error handling
createErrorGuard()
```

### 5. Route Factory

Factory pattern for creating standardized routes:

```typescript
// Create a basic route
RouteFactory.createRoute(path, name, component, meta)

// Create a layout route
RouteFactory.createLayoutRoute(name, component, children, meta)

// Create a lazy route
RouteFactory.createLazyRoute(path, name, importFn, meta)
```

### 6. Validation

Route configuration validation:

```typescript
const validator = new RouteValidator();
const isValid = validator.isValid(routes);
const summary = validator.getValidationSummary(routes);
```

## Usage Examples

### Creating a New Route

```typescript
import { RouteFactory, META_KEYS } from '@/router';

const newRoute = RouteFactory.createRoute(
  '/new-feature',
  'NewFeature',
  () => import('@/views/NewFeature.vue'),
  {
    [META_KEYS.TITLE]: 'New Feature',
    [META_KEYS.ICON]: 'star',
    [META_KEYS.REQUIRES_AUTH]: true,
  }
);
```

### Adding Navigation Guards

```typescript
import { createAuthGuard } from '@/router';

// In your router configuration
router.beforeEach(createAuthGuard());
```

### Validating Routes

```typescript
import { RouteValidator } from '@/router';

const validator = new RouteValidator();
const errors = validator.validateRoutes(routes);

if (!validator.isValid(routes)) {
  console.error('Route validation failed:', errors);
}
```

## Migration Guide

### From Old Router Structure

1. **Update imports**: Use new types and constants
2. **Replace meta properties**: Use `META_KEYS` constants
3. **Add lazy loading**: Convert direct imports to lazy imports
4. **Use factory methods**: Leverage `RouteFactory` for new routes

### Example Migration

**Before:**
```typescript
{
  path: "/dashboard/list",
  component: List,
  name: "List",
  meta: {
    i18nKey: "dashboardList",
    activate: true,
    title: "Dashboard List",
  },
}
```

**After:**
```typescript
{
  path: ROUTE_PATHS.DASHBOARD.LIST,
  component: () => import("@/views/dashboard/List.vue"),
  name: "DashboardList",
  meta: {
    [META_KEYS.I18N_KEY]: "dashboardList",
    [META_KEYS.ACTIVATE]: true,
    [META_KEYS.TITLE]: "Dashboard List",
    [META_KEYS.BREADCRUMB]: true,
  },
}
```

## Best Practices

1. **Use constants**: Always use `ROUTE_PATHS` and `META_KEYS` constants
2. **Lazy load**: Use lazy loading for all route components
3. **Validate**: Run route validation during development
4. **Type safety**: Use `AppRouteRecordRaw` type for all routes
5. **Factory pattern**: Use `RouteFactory` for creating new routes
6. **Consistent naming**: Follow the established naming conventions

## Testing

The router system includes comprehensive testing utilities:

```typescript
import { RouteValidator, RouteAnalyzer } from '@/router';

// Validate routes
const validator = new RouteValidator();
const isValid = validator.isValid(routes);

// Analyze route structure
const analysis = RouteAnalyzer.analyzeRoutes(routes);
console.log(`Total routes: ${analysis.totalRoutes}`);
console.log(`Lazy routes: ${analysis.lazyRoutes}`);
```

## Future Enhancements

- [ ] Authentication guard implementation
- [ ] Route-based code splitting
- [ ] Advanced route caching
- [ ] Route performance monitoring
- [ ] Dynamic route generation
- [ ] Route analytics and metrics
