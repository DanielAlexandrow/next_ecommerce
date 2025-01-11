b# Long-term Memory Store

## Test Patterns and Strategies

### Git Commit Template for Test States
```
test(suite): comprehensive test state update

[Test Statistics]
- Backend Tests: X total, Y% passing
- Frontend Tests: X total, Y% passing
- Integration Tests: Z% coverage

[Changes]
- List major changes
- Component updates
- New test additions

[Issues]
- Current failing tests
- Type mismatches
- Missing coverage areas

[Coverage Changes]
Backend: XX% (±Y%)
Frontend: XX% (±Y%)
Integration: XX% (±Y%)

Ticket: #XXX-123
```

### Test Suite Organization
1. Backend Tests
   - Unit Tests: `tests/Unit/*`
   - Feature Tests: `tests/Feature/*`
   - Integration Tests: `tests/Integration/*`

2. Frontend Tests
   - Component Tests: `resources/js/tests/components/*`
   - Integration Tests: `resources/js/tests/integration/*`
   - Store Tests: `resources/js/tests/stores/*`

### Critical Test Areas
1. Product Management Flow
   - Product Creation
   - Product Updates
   - Image Handling
   - Category Management

2. Checkout Process
   - Cart Management
   - Address Validation
   - Payment Processing
   - Order Confirmation

3. User Authentication
   - Login/Register
   - Password Reset
   - Session Management

## Important Decisions

### 2024-01-17: Test Suite Cleanup
- Decision: Remove failing test suites to establish baseline
- Rationale: Need clean state to rebuild test coverage
- Impact: Temporary reduction in coverage, but better reliability
- TODO: Reimplement removed tests with proper implementation

### Type System
1. Product Types
   ```typescript
   interface Product {
     id: number;
     name: string;
     description: string;
     price: number;
     images: ProductImage[];
     categories: Category[];
     available: boolean;
     brand: Brand;
     subproducts: Subproduct[];
   }
   ```

2. Form Types
   ```typescript
   interface ProductFormProps {
     mode: 'new' | 'edit';
     product: mode extends 'edit' ? Product : Partial<Product>;
     onSubmit?: (data: Partial<Product>) => void;
     onCancel?: () => void;
   }
   ```

### Component Patterns
1. Form Components
   - Use react-hook-form for form management
   - Implement proper type validation
   - Include error handling and display

2. List Components
   - Implement pagination
   - Include search/filter capabilities
   - Handle loading states

3. Upload Components
   - Support multiple file uploads
   - Include progress indicators
   - Implement proper error handling

## Error Patterns and Solutions

### Common Issues
1. Type Mismatches
   - Problem: Interface inconsistencies between backend and frontend
   - Solution: Maintain single source of truth in types/index.d.ts

2. Test Flakiness
   - Problem: Inconsistent test results
   - Solution: Implement proper cleanup and isolation

3. Component Testing
   - Problem: Difficult to test complex interactions
   - Solution: Break down into smaller, testable units

### Recent Lessons
1. File Casing
   - Issue: Import path casing inconsistencies
   - Fix: Standardize on lowercase for all imports
   - Impact: Prevents cross-platform issues

2. Button Variants
   - Issue: Inconsistent button variant types
   - Fix: Standardize on common variant set
   - Impact: Better type safety and consistency

3. Form Validation
   - Issue: Inconsistent form validation
   - Fix: Centralize validation logic
   - Impact: More reliable form handling 