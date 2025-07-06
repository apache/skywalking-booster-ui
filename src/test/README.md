# Testing Guide for SkyWalking Booster UI

This document provides comprehensive information about the testing setup and how to run tests for the SkyWalking Booster UI project.

## Overview

The project uses **Vitest** as the primary testing framework with **Vue Test Utils** for component testing. The testing setup includes:

- Unit tests for utilities, components, hooks, and stores
- Integration tests for application features
- Comprehensive mocking for external dependencies
- Code coverage reporting

## Test Structure

```
src/
├── test/
│   ├── setup.ts              # Global test setup and mocks
│   ├── utils/
│   │   └── index.ts          # Test utilities and helpers
│   ├── runner.ts             # Test configuration and patterns
│   └── README.md             # This file
├── utils/
│   └── __tests__/
│       ├── is.spec.ts        # Type checking utility tests
│       ├── dateFormat.spec.ts # Date formatting tests
│       ├── debounce.spec.ts  # Debounce function tests
│       └── copy.spec.ts      # Clipboard utility tests
├── components/
│   └── __tests__/
│       └── Icon.spec.ts      # Component tests
├── hooks/
│   └── __tests__/
│       └── useDuration.spec.ts # Hook tests
├── store/
│   └── modules/
│       └── __tests__/
│           └── app.spec.ts   # Store tests
└── __tests__/
    ├── main.spec.ts          # Main app tests
    └── App.spec.ts           # App component tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Run tests with coverage
npm run test:unit:coverage

# Run all tests with verbose output and coverage
npm run test:all
```

### Category-Specific Tests

```bash
# Run utility tests only
npm run test:utils

# Run component tests only
npm run test:components

# Run hook tests only
npm run test:hooks

# Run store tests only
npm run test:stores

# Run view tests only
npm run test:views
```

### Individual Test Files

```bash
# Run a specific test file
npx vitest src/utils/__tests__/is.spec.ts

# Run tests matching a pattern
npx vitest --run src/utils/**/*.spec.ts
```

## Test Configuration

### Vitest Configuration

The project uses `vitest.config.ts` with the following features:

- **Environment**: jsdom for DOM simulation
- **Plugins**: Vue and Vue JSX support
- **Aliases**: Path mapping for `@/` imports
- **Coverage**: V8 provider with multiple reporters
- **Setup**: Global test setup file

### Global Setup (`src/test/setup.ts`)

The global setup includes:

- Element Plus plugin configuration
- Browser API mocks (matchMedia, ResizeObserver, etc.)
- Console method mocking
- Timer mocking for consistent test behavior

## Writing Tests

### Utility Tests

Utility functions should be tested for:

- **Happy path**: Normal usage scenarios
- **Edge cases**: Empty inputs, null values, etc.
- **Error handling**: Invalid inputs and error conditions
- **Performance**: Large inputs and multiple calls

Example:

```typescript
import { describe, it, expect } from "vitest";
import { isString } from "../is";

describe("isString utility", () => {
  it("should return true for strings", () => {
    expect(isString("hello")).toBe(true);
    expect(isString("")).toBe(true);
  });

  it("should return false for non-strings", () => {
    expect(isString(123)).toBe(false);
    expect(isString(null)).toBe(false);
  });
});
```

### Component Tests

Component tests should verify:

- **Rendering**: Correct DOM structure
- **Props**: Proper prop handling
- **Events**: Event emission and handling
- **Slots**: Content projection
- **Styling**: CSS class application

Example:

```typescript
import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Icon from "../Icon.vue";

describe("Icon Component", () => {
  it("should render with default props", () => {
    const wrapper = mount(Icon);
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("should apply size classes", () => {
    const wrapper = mount(Icon, { props: { size: "lg" } });
    expect(wrapper.classes()).toContain("lg");
  });
});
```

### Hook Tests

Hook tests should cover:

- **State management**: State updates and reactivity
- **Side effects**: Lifecycle and cleanup
- **Return values**: Correct return types and values
- **Dependencies**: External dependency interactions

Example:

```typescript
import { describe, it, expect, vi } from "vitest";
import { useDuration } from "../useDuration";

describe("useDuration hook", () => {
  it("should return duration functions", () => {
    const { getDurationTime, setDurationRow } = useDuration();
    expect(typeof getDurationTime).toBe("function");
    expect(typeof setDurationRow).toBe("function");
  });
});
```

### Store Tests

Store tests should verify:

- **State**: Initial state and state updates
- **Getters**: Computed properties
- **Actions**: State mutations and async operations
- **Integration**: Store interactions

Example:

```typescript
import { describe, it, expect } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { appStore } from "../app";

describe("App Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should initialize with default state", () => {
    const store = appStore();
    expect(store.utc).toBe("");
  });
});
```

## Mocking

### External Dependencies

The project includes comprehensive mocking for:

- **Element Plus**: UI components and notifications
- **Vue Router**: Route management
- **GraphQL**: API calls
- **Browser APIs**: Clipboard, timers, etc.

### Mock Examples

```typescript
// Mock Element Plus
vi.mock("element-plus", () => ({
  ElNotification: vi.fn(),
}));

// Mock Vue Router
vi.mock("vue-router", () => ({
  useRoute: vi.fn(() => ({ name: "Home" })),
}));

// Mock GraphQL
vi.mock("@/graphql", () => ({
  default: {
    query: vi.fn(() => ({
      params: vi.fn(() => Promise.resolve({ data: {} })),
    })),
  },
}));
```

## Coverage

### Coverage Configuration

The project generates coverage reports with:

- **Provider**: V8 (fast and accurate)
- **Reporters**: Text, JSON, and HTML
- **Exclusions**: Node modules, test files, types, etc.

### Coverage Targets

- **Statements**: 80%+
- **Branches**: 70%+
- **Functions**: 80%+
- **Lines**: 80%+

### Viewing Coverage

```bash
# Generate coverage report
npm run test:unit:coverage

# Open HTML coverage report
open coverage/index.html
```

## Best Practices

### Test Organization

1. **Group related tests**: Use `describe` blocks for logical grouping
2. **Clear test names**: Use descriptive `it` block names
3. **Arrange-Act-Assert**: Structure tests with clear sections
4. **One assertion per test**: Focus on single behavior

### Test Data

1. **Use factories**: Create test data factories for complex objects
2. **Avoid magic numbers**: Use constants for test values
3. **Clean up**: Reset state between tests
4. **Mock external calls**: Don't rely on external services

### Performance

1. **Fast tests**: Keep tests under 100ms each
2. **Parallel execution**: Use `--threads` for faster runs
3. **Selective testing**: Run only relevant tests during development
4. **Watch mode**: Use watch mode for rapid feedback

## Troubleshooting

### Common Issues

1. **Import errors**: Check path aliases and mock setup
2. **Timing issues**: Use `vi.useFakeTimers()` and `vi.advanceTimersByTime()`
3. **DOM errors**: Ensure jsdom environment is configured
4. **Async issues**: Use `await` and proper promise handling

### Debug Mode

```bash
# Run tests with debug output
npx vitest --reporter=verbose

# Run specific test with debug
npx vitest --run --reporter=verbose src/utils/__tests__/is.spec.ts
```

## Continuous Integration

The testing setup is configured for CI/CD with:

- **Automated testing**: Runs on every commit
- **Coverage reporting**: Tracks coverage trends
- **Parallel execution**: Optimized for CI environments
- **Failure reporting**: Clear error messages and stack traces

## Contributing

When adding new tests:

1. **Follow naming conventions**: Use `.spec.ts` suffix
2. **Add to appropriate category**: Place tests in correct directories
3. **Update documentation**: Document new test patterns
4. **Maintain coverage**: Ensure new code is well-tested
5. **Review existing tests**: Follow established patterns

For more information, see the [Vitest documentation](https://vitest.dev/) and [Vue Test Utils guide](https://test-utils.vuejs.org/).
