# Edge Cases Registry

## Testing Environment

### ResizeObserver Issues
- **Case**: ResizeObserver not defined in JSDOM environment
- **Solution**: Mock ResizeObserver in test setup
- **Implementation**:
  ```typescript
  const mockResizeObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
  }));
  vi.stubGlobal('ResizeObserver', mockResizeObserver);
  ```

### Module Import Issues
- **Case**: ES Module imports failing in test environment
- **Solution**: Configure Vitest to handle ESM imports
- **Implementation**: Update vitest.config.ts with proper module resolution

### Form Testing
- **Case**: React Hook Form state not properly tracked in tests
- **Solution**: Complete mock implementation of form library
- **Implementation**: Mock all exports including FormProvider and Controller

## API Integration

### Data Synchronization
- **Case**: Test data not properly reset between tests
- **Solution**: Implement proper cleanup in afterEach hooks
- **Implementation**: Reset store state and clear all mocks

### API Mocking
- **Case**: Inconsistent API mock behavior
- **Solution**: Standardized API mocking approach
- **Implementation**: Use MSW or consistent vi.mock patterns 