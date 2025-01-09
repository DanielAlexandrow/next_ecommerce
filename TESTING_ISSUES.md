# Testing Issues and Solutions

## Current Issues (2024-04-04)

### 1. ResizeObserver Not Defined
- **Error**: `ReferenceError: ResizeObserver is not defined`
- **Affected Components**: 
  - ProductSearch
  - Radix UI components (Slider, Switch)
- **Root Cause**: JSDOM environment doesn't provide ResizeObserver
- **Solution**: 
  - Update `resources/js/tests/setup.ts` to include a proper ResizeObserver mock
  - Ensure mock handles all required methods and properties

### 2. Module Import Issues
- **Error**: `Cannot find module '@/api/cartApi'`
- **Error**: `require() of ES Module @inertiajs/react not supported`
- **Affected Tests**:
  - ProductCard tests
  - Checkout tests
- **Root Cause**: 
  - Module resolution issues
  - ESM/CommonJS compatibility problems
- **Solution**:
  - Update Vite/Vitest configuration for proper module resolution
  - Create proper mock files for API modules
  - Configure ESM imports correctly

### 3. Test Assertion Failures
- **Issue**: Cart API calls not receiving expected parameters
- **Issue**: Toast notifications not being called as expected
- **Affected Tests**:
  - Checkout component tests
  - ProductCard tests
- **Solution**:
  - Review and update mock implementations
  - Ensure proper test setup and teardown
  - Verify test data matches expected formats

### 4. API Integration Issues
- **Issue**: Tests failing due to direct API usage instead of mocks
- **Issue**: CORS issues when trying to access real API endpoints
- **Solution**:
  - Implement proper API mocking strategy
  - Update test environment configuration
  - Add proper error handling in tests

## Implementation Plan

1. Fix Test Environment Setup
   - [ ] Implement proper ResizeObserver mock
   - [ ] Configure module resolution for tests
   - [ ] Set up proper ESM support

2. Update Test Infrastructure
   - [ ] Configure API client for test environment
   - [ ] Set up proper CORS handling for tests
   - [ ] Add missing test IDs to components

3. Improve Test Patterns
   - [ ] Standardize API interaction in tests
   - [ ] Implement consistent error handling
   - [ ] Add proper loading state tests

## Next Steps

1. Fix ResizeObserver mock in test setup
2. Update module resolution configuration
3. Add missing test IDs to components
4. Implement proper API test configuration

## Lessons Learned

1. Direct API Testing Challenges
   - Need proper CORS configuration
   - Must handle authentication in tests
   - Consider test data isolation

2. Component Testing Best Practices
   - Add data-testid attributes consistently
   - Mock browser APIs properly
   - Handle async operations correctly 