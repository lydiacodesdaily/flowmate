# Testing Guide

This document provides information about the testing setup and how to run tests for the FlowMate mobile app.

## Testing Stack

- **Jest**: Test runner and framework
- **React Native Testing Library**: Component testing utilities
- **jest-expo**: Expo preset for Jest configuration

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

Tests are organized alongside the code they test using the `__tests__` directory pattern:

```
src/
├── services/
│   ├── statsService.ts
│   ├── audioService.ts
│   └── __tests__/
│       ├── statsService.test.ts
│       └── audioService.test.ts
├── contexts/
│   ├── TimerContext.tsx
│   └── __tests__/
│       └── TimerContext.test.tsx
└── screens/
    ├── StatsScreen.tsx
    └── __tests__/
        └── StatsScreen.test.tsx
```

## Test Coverage

Current test suites cover:

### Unit Tests
- **statsService**: Session recording, stats calculation, streak tracking
- **audioService**: Audio initialization, settings management, sound playback

### Integration Tests
- **TimerContext**: Timer state management, callbacks, session transitions

### Component Tests
- **StatsScreen**: Data display, loading states, user interactions

### Coverage Goals

The project has the following coverage thresholds:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

To view detailed coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Mocked Dependencies

The test setup includes mocks for common Expo and React Native modules:

- `@react-native-async-storage/async-storage`
- `expo-audio`
- `expo-haptics`
- `expo-keep-awake`
- `expo-notifications`
- `react-native-safe-area-context`
- `@react-navigation/native`

These mocks are configured in `jest.setup.js`.

## Writing Tests

### Example: Testing a Service

```typescript
import { statsService } from '../statsService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('StatsService', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await statsService.clearStats();
  });

  it('should record a session', async () => {
    const session = {
      id: '1',
      type: 'focus',
      durationMinutes: 25,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    };

    await statsService.recordSession(session);
    const stats = await statsService.getStats();

    expect(stats.totalSessions).toBe(1);
    expect(stats.totalFocusTime).toBe(25);
  });
});
```

### Example: Testing a Component

```typescript
import { render, waitFor } from '@testing-library/react-native';
import { StatsScreen } from '../StatsScreen';

describe('StatsScreen', () => {
  it('should display stats', async () => {
    const { getByText } = render(
      <StatsScreen navigation={mockNav} route={mockRoute} />
    );

    await waitFor(() => {
      expect(getByText('your progress')).toBeTruthy();
    });
  });
});
```

### Example: Testing a Context Hook

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { TimerProvider, useTimerContext } from '../TimerContext';

const wrapper = ({ children }) => <TimerProvider>{children}</TimerProvider>;

describe('TimerContext', () => {
  it('should start timer', () => {
    const { result } = renderHook(() => useTimerContext(), { wrapper });

    act(() => {
      result.current.startTimer(
        [{ type: 'focus', durationMinutes: 25 }],
        'pomodoro',
        'focus'
      );
    });

    expect(result.current.status).toBe('running');
  });
});
```

## Best Practices

1. **Clear mocks between tests**: Use `jest.clearAllMocks()` in `beforeEach`
2. **Use fake timers for time-based tests**: `jest.useFakeTimers()`
3. **Wait for async operations**: Use `waitFor` from React Native Testing Library
4. **Test user interactions**: Use `fireEvent` or direct prop calls
5. **Avoid implementation details**: Test behavior, not internal state
6. **Keep tests focused**: One assertion per test when possible
7. **Use descriptive test names**: Clearly state what is being tested

## Debugging Tests

### Run a specific test file
```bash
npm test -- statsService.test.ts
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should record a session"
```

### Update snapshots (if using snapshot tests)
```bash
npm test -- -u
```
