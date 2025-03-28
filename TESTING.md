# Testing Documentation

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

## Lessons Learned

1. **Factory Usage**
   - Always use factories for model creation in tests
   - Use `factory()->make()` with `save()` for relationships instead of direct `create()`
   - Customize factories per test case as needed

2. **Special Characters**
   - When testing with special characters, use `assertJsonFragment` instead of `assertDatabaseHas`
   - Database may store special characters differently than they are sent
   - Use `assertStringContainsString` for partial matches when exact matches are not needed

3. **ResizeObserver Mock**
   - Frontend tests require a mock for `ResizeObserver`
   - Mock should be added to `vitest.setup.ts`
   - Mock implementation:
     ```typescript
     const mockResizeObserver = vi.fn(() => ({
         observe: vi.fn(),
         unobserve: vi.fn(),
         disconnect: vi.fn(),
     }));
     vi.stubGlobal('ResizeObserver', mockResizeObserver);
     ```

4. **Vite Manifest Issues**
   - When running tests with Inertia.js pages, ensure the Vite manifest is properly generated
   - Error: `Unable to locate file in Vite manifest: resources/js/pages/admin/X.tsx`
   - Solutions:
     - Mock the Vite facade in your test classes
     - Run `npm run build` before tests to generate the manifest
     - Add a custom test helper that creates mock Vite entries for testing

5. **Authentication Redirects**
   - Always check the correct redirect path in authentication tests
   - For admin routes, the redirect may be to '/adminlogin' instead of '/login'
   - Use `assertRedirect(route('login'))` instead of hardcoded paths

6. **Object Availability in Tests**
   - `Attempt to read property "id" on null` errors typically indicate an object wasn't created successfully
   - Always check if model creation succeeded before using its properties
   - Use `assertNotNull($object)` before accessing object properties

## Common Issues and Solutions

1. **Data Validation**
   - Issue: Missing required fields in tests
   - Solution: Use test data factories with complete data

2. **Special Characters**
   - Issue: Database stores special characters differently
   - Solution: Use partial string matching for assertions

3. **Frontend Component Tests**
   - Issue: Missing ResizeObserver
   - Solution: Add mock to vitest.setup.ts

4. **Vite Asset Loading in Tests**
   - Issue: Unable to locate file in Vite manifest
   - Solution: Mock the Vite facade in your TestCase setup
   ```php
   // In your TestCase.php or specific test class
   public function setUp(): void
   {
       parent::setUp();
       // Mock Vite to prevent manifest errors
       $this->mock(\Illuminate\Foundation\Vite::class, function ($mock) {
           $mock->shouldReceive('__invoke')->andReturn('');
       });
   }
   ```

5. **Controller Test Setup**
   - Issue: Undefined properties like `$this->admin`
   - Solution: Initialize all required properties in setUp method
   ```php
   protected function setUp(): void
   {
       parent::setUp();
       $this->admin = User::factory()->create(['role' => 'admin']);
       $this->user = User::factory()->create(['role' => 'customer']);
   }
   ```

6. **Collection Method Errors**
   - Issue: `Method Collection::paginate does not exist`
   - Solution: Use Laravel's built-in pagination on query builders instead of collections
   ```php
   // Incorrect
   $collection->paginate(10);
   
   // Correct
   Model::query()->paginate(10);
   // or
   DB::table('table')->paginate(10);
   ```

7. **Model Availability for Tests**
   - Issue: Cart or other model creation failing silently
   - Solution: Check model validation rules and use assertDatabaseHas to confirm creation
   ```php
   $cart = Cart::create(['user_id' => $user->id]);
   $this->assertNotNull($cart, 'Cart creation failed');
   $this->assertDatabaseHas('cart', ['user_id' => $user->id]);
   ```

## API Documentation

### Product API
- `POST /api/products`
  - Creates a new product with subproducts
  - Handles special characters in names and descriptions

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