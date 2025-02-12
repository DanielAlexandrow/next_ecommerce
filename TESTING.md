# Testing Documentation

## Testing Strategy and Priority Order

1. **PHP Tests (First Priority)**
   ```bash
   php artisan test
   ```
   - Run PHP tests first
   - Fix any failing tests before proceeding
   - Includes unit tests, feature tests, and integration tests
   - Only proceed to next step if all PHP tests pass

2. **Vitest Frontend Tests (Second Priority)**
   ```bash
   pnpm test
   ```
   - Run after all PHP tests pass
   - Fix any failing tests before proceeding
   - Includes component tests, hooks tests, and utility tests
   - Only proceed to next step if all Vitest tests pass

3. **Playwright E2E Tests (Third Priority)**
   ```bash
   pnpm run test:e2e
   ```
   - Run only after PHP and Vitest tests pass
   - End-to-end testing of complete user flows
   - Fix any failing tests before deployment
   - Most comprehensive but slowest tests

## Test Fixing Strategy
1. Fix tests in order of priority
2. Do not proceed to next test suite until current suite passes
3. Document any test fixes in commit messages
4. Update test documentation when test behavior changes

## Lessons Learned

1. **Factory Usage**
   - Always use factories for model creation in tests
   - Use `factory()->make()` with `save()` for relationships instead of direct `create()`
   - The `SubproductFactory` automatically generates unique SKUs using `fake()->unique()->ean13()`

2. **Special Characters**
   - When testing with special characters, use `assertJsonFragment` instead of `assertDatabaseHas`
   - Database may store special characters differently than they are sent
   - Use `assertStringContainsString` for partial matches when exact matches are not needed

3. **ResizeObserver Mock**
   - Frontend tests require a mock for `ResizeObserver`
   - Mock should be added to `vitest.setup.ts`
   - Mock implementation:
     ```javascript
     const mockResizeObserver = vi.fn(() => ({
         observe: vi.fn(),
         unobserve: vi.fn(),
         disconnect: vi.fn(),
     }));
     vi.stubGlobal('ResizeObserver', mockResizeObserver);
     ```

## Testing Strategies

### Frontend Testing
1. **Component Tests**
   - Mock global browser APIs (e.g., ResizeObserver)
   - Use `vi.mock()` for external dependencies
   - Test edge cases (max length, special characters)
   - Test error handling and loading states

### Backend Testing
1. **Model Tests**
   - Use factories for all model creation
   - Test relationships and constraints
   - Test edge cases with data variations

2. **Service Tests**
   - Test business logic in isolation
   - Mock external dependencies
   - Test error cases and edge conditions

3. **API Tests**
   - Test request validation
   - Test response structure
   - Test error handling
   - Test authentication and authorization

## Common Issues and Solutions

1. **SKU Generation**
   - Issue: Missing SKU values in tests
   - Solution: Use `SubproductFactory` which automatically generates unique SKUs

2. **Special Characters**
   - Issue: Database stores special characters differently
   - Solution: Use partial matches or JSON response assertions

3. **Frontend Component Tests**
   - Issue: Missing ResizeObserver
   - Solution: Add mock to `vitest.setup.ts`

## API Documentation

### Product API
- `POST /api/products`
  - Creates a new product with subproducts
  - Handles special characters in names and descriptions
  - Validates unique SKUs across subproducts

### Order API
- `POST /api/orders`
  - Creates a new order from cart items
  - Updates product stock
  - Validates stock availability

### Checkout API
- `POST /api/checkout`
  - Processes checkout from cart
  - Creates order and order items
  - Clears cart after successful checkout 
