# Test Issues Tracker

## Latest Test Run (2024-01-09)

### Failed Tests Summary
1. `resources/js/tests/e2e/AdminSidebar.test.ts`
   - Issue: Playwright Test configuration error
   - Error: Unexpected test.describe() call
   - Status: ⚠️ Configuration Error
   - Fix Required: Review Playwright test setup and configuration

2. `resources/js/tests/components/Admin/ProductForm/ProductForm.test.tsx`
   - Issues:
     - `handles input changes`: mockSetValue not called as expected
     - `handles checkbox toggle`: mockSetValue not called as expected
   - Status: ⚠️ Mock Function Issues
   - Fix Required: Review mock setup and event handling

3. `resources/js/tests/components/Store/Review/ReviewComponent.test.tsx`
   - Issues:
     - `validates form inputs`: Toast error not called with expected message
     - `handles review submission`: createReview API not called as expected
     - `handles API errors gracefully`: Wrong error message shown
     - `handles loading state during sort`: Missing opacity-50 class
   - Status: ⚠️ Multiple Issues
   - Fix Required: Review form validation, API integration, and loading state implementation

### Test Statistics
- Total Test Files: 22
- Passed Files: 19
- Failed Files: 3
- Total Tests: 117
- Passed Tests: 111
- Failed Tests: 6
- Success Rate: 94.87%

### Common Patterns in Failures
1. Mock Function Issues
   - Several tests failing due to mock functions not being called as expected
   - Potential issue with event handling or mock setup

2. Component State Management
   - Loading states not properly reflected in UI
   - Form validation state issues

3. API Integration
   - Review submission and error handling not working as expected

### Action Items
1. Fix Playwright configuration for E2E tests
2. Review mock setup in ProductForm tests
3. Audit ReviewComponent implementation:
   - Form validation logic
   - API integration
   - Loading state management
   - Error handling

### Previous Issues Resolution Status
[Previous issues will be listed here when comparing with past runs] 