# Test Memory Bank

## Package Manager
- Using pnpm for dependency management and script execution
- Command pattern: `pnpm test` for running vitest.

## Active Test Iterations

### Current Focus (2024-04-04)
```json
{
  "current_test": "ProductSearch.test.tsx",
  "status": "failing",
  "last_successful_state": "2024-01-20_all_tests_passing",
  "safe_rollback_point": "HEAD",
  "context": {
    "env_vars_required": [],
    "database_state": "clean",
    "service_mocks": ["productSearchStore"],
    "dependencies_checked": true,
    "total_tests": 25,
    "total_assertions": 75,
    "execution_time": "2.39s",
    "coverage_summary": {
      "unit_tests": 20,
      "feature_tests": 5,
      "total_coverage": "80%"
    }
  }
}
```

### Latest Test Results (2024-04-04)
```json
{
  "test_suites": {
    "component_tests": {
      "AddNewBrandModal": {
        "status": "PARTIAL_FAIL",
        "passed": 4,
        "failed": 1,
        "error": "Update brand text not found in component"
      },
      "BrandsPage": {
        "status": "PASS",
        "passed": 3,
        "failed": 0
      },
      "ProductSearch": {
        "status": "FAIL",
        "passed": 0,
        "failed": 4,
        "error": "Missing filterSchema mock in productSearchStore"
      },
      "BrandSelect": {
        "status": "PASS",
        "passed": 4,
        "failed": 0
      },
      "CategorySelect": {
        "status": "PASS",
        "passed": 4,
        "failed": 0
      },
      "ImageSelect": {
        "status": "PASS",
        "passed": 5,
        "failed": 0
      }
    }
  },
  "summary": {
    "total_tests": 25,
    "passed_tests": 20,
    "failed_tests": 5,
    "execution_time": "2.39s",
    "improvements_needed": [
      "Fix AddNewBrandModal update mode",
      "Add proper mocking for productSearchStore"
    ]
  }
}
```

### Areas for Future Testing
```json
{
  "priority_areas": [
    {
      "area": "Guest Checkout",
      "description": "Complete guest checkout flow testing",
      "priority": "high"
    },
    {
      "area": "Stock Management",
      "description": "Test concurrent stock updates and race conditions",
      "priority": "high"
    },
    {
      "area": "Order Processing",
      "description": "Test order status transitions and notifications",
      "priority": "medium"
    },
    {
      "area": "Payment Integration",
      "description": "Test payment gateway integration and callbacks",
      "priority": "medium"
    }
  ]
}
```

## Success Patterns

### 1. Isolated Changes
- Keep relationship tests separate from CRUD tests
- Test one model method at a time
- Verify cascade effects before committing

### 2. Safe Testing Practices
- Always use database transactions
- Clean up created data in tearDown
- Mock external services
- Use factories for test data

### 3. Known Good Patterns
- Category-Product relationship testing
- Navigation item CRUD operations
- Basic authentication flows
- Order processing validation
- Product deletion with proper error handling

### 4. Test Implementation Patterns
```json
{
  "controller_tests": {
    "authorization": {
      "pattern": "Test both authorized and unauthorized access",
      "example": "test_destroy_product_as_admin and test_destroy_product_as_non_admin"
    },
    "input_validation": {
      "pattern": "Test invalid input formats",
      "example": "test_destroy_product_with_invalid_id"
    },
    "error_handling": {
      "pattern": "Test all possible error scenarios",
      "examples": [
        "ModelNotFoundException",
        "Generic service exceptions"
      ]
    }
  }
}
```

## Failure History

### 2024-04-04 Test Failures
```json
[
  {
    "attempt": 1,
    "timestamp": "2024-04-04 11:47",
    "test": "AddNewBrandModal.test.tsx",
    "change_made": "Testing brand update mode",
    "result": "Unable to find 'Update brand' text in component",
    "cascade_effects": [],
    "lesson": "Component text content doesn't match test expectations",
    "recovery_action": "Need to verify component text content in update mode",
    "context": {
      "env_state": "test",
      "component_state": "update_mode",
      "related_tests": ["AddNewBrandModal.test.tsx"]
    }
  },
  {
    "attempt": 1,
    "timestamp": "2024-04-04 11:47",
    "test": "ProductSearch.test.tsx",
    "change_made": "Testing product search functionality",
    "result": "Missing filterSchema export in productSearchStore mock",
    "cascade_effects": ["All ProductSearch tests failing"],
    "lesson": "Store mocks need to include all exported values",
    "recovery_action": "Need to add filterSchema to productSearchStore mock",
    "context": {
      "env_state": "test",
      "mocked_services": ["productSearchStore"],
      "related_tests": ["ProductSearch.test.tsx"]
    }
  }
]
```

### Template
```json
{
  "attempt": 0,
  "timestamp": "YYYY-MM-DD HH:mm",
  "test": "test_name",
  "change_made": "description",
  "result": "failure_description",
  "cascade_effects": [],
  "lesson": "what_we_learned",
  "recovery_action": "what_we_did",
  "context": {
    "env_state": {},
    "database_state": {},
    "mocked_services": [],
    "related_tests": []
  }
}
```

### Recorded Failures
```json
[]
```

## Context Patterns
```json
{
  "database_patterns": {
    "clean_slate": {
      "description": "Fresh migration with no seeders",
      "suitable_for": ["basic_crud_tests", "relationship_tests"]
    },
    "seeded_state": {
      "description": "Basic seeders run",
      "suitable_for": ["integration_tests", "feature_tests"]
    }
  },
  "service_patterns": {
    "fully_mocked": {
      "description": "All external services mocked",
      "suitable_for": ["unit_tests", "controller_tests"]
    },
    "partial_integration": {
      "description": "Core services real, external mocked",
      "suitable_for": ["feature_tests", "api_tests"]
    }
  }
}
```

## Test Running Protocol

1. **Before Running New Test**
   - Ensure all existing tests pass
   - Document current state
   - Have rollback point ready
   - Verify context requirements

2. **During Test Run**
   - Run single test in isolation
   - Monitor for cascade effects
   - Document any unexpected behavior
   - Track context changes

3. **After Test Run**
   - If successful, update success patterns
   - If failed, update failure history
   - Plan next iteration based on results
   - Update context documentation

## Environment States
```json
{
  "testing": {
    "database": "sqlite_memory",
    "cache": "array",
    "session": "array",
    "queue": "sync"
  },
  "feature_testing": {
    "database": "sqlite_file",
    "cache": "file",
    "session": "file",
    "queue": "database"
  }
}
```

## Quick Commands
```bash
# Run single test
php artisan test --filter=TestName

# Frontend tests
pnpm test
````

# Run test in isolation
php artisan test --filter=TestName --stop-on-failure

# Save current state
git commit -am "test: Save state before TestName"

# Quick rollback
git reset --hard HEAD~1

# Check test environment
php artisan env:test-check

# Verify database state
php artisan db:check-state

# Reset test environment
php artisan test:reset-env
```

## Route Patterns

### 1. Public Routes
```json
{
  "main_routes": {
    "home": "/",
    "product_search": "/productsearch",
    "navigation_data": "/navigation/getnavdata",
    "category_service": "/categoryservice"
  },
  "cart_routes": {
    "view": "/cart",
    "add": "/cart/add",
    "remove": "/cart/remove",
    "get_items": "/getcartitems"
  },
  "checkout": {
    "process": "/checkout/{cartId}"
  }
}
```

### 2. Authenticated Routes
```json
{
  "product_management": {
    "crud_operations": "/products/*",
    "reviews": "/products/{product}/reviews",
    "subproducts": "/subproducts/*"
  },
  "category_management": {
    "base": "/categories",
    "operations": [
      "GET /",
      "POST /",
      "PUT /{id}",
      "DELETE /{id}",
      "GET /search",
      "POST /bulk-delete",
      "GET /hierarchy"
    ]
  },
  "order_management": {
    "base": "/orders",
    "details": "/orders/getitems/{order_id}",
    "pdf": "/orders/generatepdf/{orderId}",
    "status": "/orders/{order}/status"
  },
  "user_profile": {
    "address": {
      "view": "/profile/adressinfo",
      "update": "/profile/updateadress"
    },
    "orders": {
      "view": "/profile/orders",
      "list": "/profile/orders/get",
      "details": "/profile/orders/getitems/{orderId}"
    },
    "password": {
      "view": "/profile/password",
      "update": "/profile/password"
    }
  },
  "driver_routes": {
    "coordinates": {
      "view": "/driver/coordinates",
      "store": "/driver/coordinates",
      "current": "/driver/coordinates/current",
      "update": "/driver/coordinates"
    },
    "orders": "/driver/orders"
  }
}
```

### 3. Route Test Patterns
```json
{
  "authentication_tests": {
    "public_access": {
      "description": "Test public route accessibility",
      "routes": ["/", "/productsearch", "/cart"]
    },
    "protected_access": {
      "description": "Test authentication middleware",
      "routes": ["/profile/*", "/orders/*"]
    }
  },
  "crud_tests": {
    "products": {
      "routes": ["/products/*"],
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    "categories": {
      "routes": ["/categories/*"],
      "methods": ["GET", "POST", "PUT", "DELETE"]
    }
  }
}
``` 

# Testing Knowledge Bank

## Form Testing with React Hook Form

### Complete Mock Structure
```typescript
vi.mock('react-hook-form', () => {
    const mockUseForm = vi.fn(() => ({
        trigger: vi.fn(),
        getValues: vi.fn(),
        handleSubmit: vi.fn(),
        control: {
            register: vi.fn(),
            unregister: vi.fn(),
            getFieldState: vi.fn()
        },
        formState: { errors: {} }
    }));

    return {
        useForm: mockUseForm,
        useFormContext: () => ({
            getFieldState: vi.fn(),
            formState: { errors: {} }
        }),
        FormProvider: ({ children }) => <>{children}</>,
        Controller: ({ render }) => render({
            field: {
                onChange: vi.fn(),
                value: ''
            }
        })
    };
});
```

### Essential Test Coverage Areas
1. Form Validation
   - Success cases
   - Error cases
   - Field-level validation
   - Form-level validation

2. User Interactions
   - Form submission
   - Field updates
   - Error displays
   - Loading states

3. Integration Points
   - API calls
   - State updates
   - Error handling
   - Success flows

### Common Testing Patterns

1. **Testing Form Validation**:
```typescript
it('handles validation failure', async () => {
    vi.mocked(useForm).mockReturnValueOnce({
        ...vi.mocked(useForm)(),
        trigger: vi.fn().mockResolvedValue(false)
    });
    // Test validation failure scenario
});
```

2. **Testing Form Submission**:
```typescript
it('handles successful submission', async () => {
    await act(async () => {
        fireEvent.click(submitButton);
    });
    expect(onSubmit).toHaveBeenCalledWith(expectedData);
});
```

3. **Testing Error States**:
```typescript
it('displays error messages', () => {
    vi.mocked(useForm).mockReturnValueOnce({
        ...vi.mocked(useForm)(),
        formState: { errors: { field: { message: 'Error' } } }
    });
    // Test error display
});
```

### Best Practices Checklist
- [ ] Mock all necessary form library exports
- [ ] Use flexible mock structures
- [ ] Test both success and error paths
- [ ] Verify UI updates and error messages
- [ ] Test component integration points
- [ ] Include loading state tests
- [ ] Test user interactions thoroughly
- [ ] Document test scenarios
- [ ] Use proper test isolation
- [ ] Follow user-centric testing approach

## Testing Learnings

### Component Testing Strategy
- Use Vitest for unit testing React components
- Mock external dependencies (e.g., @inertiajs/react, framer-motion)
- Test both rendering and interactive behavior
- Ensure accessibility features are tested
- Verify responsive design classes

### Common Test Patterns
1. Rendering Tests
   - Verify component renders correctly
   - Check for presence of key elements
   - Validate text content and classes

2. Interactive Tests
   - Test user interactions (clicks, form inputs)
   - Verify state changes
   - Test error handling

3. Integration Tests
   - Test component interactions
   - Verify data flow
   - Test API interactions

### Best Practices
- Keep tests focused and isolated
- Use meaningful test descriptions
- Mock only what's necessary
- Test edge cases and error states
- Maintain test readability

### Lessons Learned
1. Component Mocking
   - Mock complex UI libraries (e.g., framer-motion)
   - Provide simplified mock implementations
   - Maintain component functionality in mocks

2. Test Organization
   - Group related tests
   - Use describe blocks effectively
   - Keep test files alongside components

3. Error Handling
   - Test both success and error paths
   - Verify error messages
   - Test boundary conditions

4. Performance
   - Mock heavy computations
   - Avoid unnecessary renders
   - Clean up after tests

### Tools and Libraries
- Vitest for unit testing
- Playwright for E2E testing
- React Testing Library
- Jest DOM matchers
- Mock Service Worker for API mocking
``` 
