# Testing React Components with Zustand Stores

## Key Learnings

### Store Testing Strategy

1. **Use Real Store Implementation**
   - Instead of mocking Zustand stores, use the actual store implementation in tests
   - Access store state and methods using `useProductSearchStore.getState()`
   - This approach catches real issues with store implementation

2. **Store Reset Pattern**
   ```typescript
   beforeEach(() => {
       const store = useProductSearchStore.getState();
       store.resetFilters();
       store.setProducts([]);
       store.setIsLoading(false);
   });
   ```

3. **Mock Only What's Necessary**
   - Mock external dependencies (API calls, router, notifications)
   - Keep the store implementation real
   - Example:
   ```typescript
   vi.mock('@/api/productApi', () => ({
       productApi: {
           searchProducts: vi.fn()
       }
   }));
   ```

### Async Testing

1. **Proper State Updates**
   - Use `act` for state updates
   - Use `waitFor` for async operations
   ```typescript
   await act(async () => {
       store.setFilters({ name: 'test' });
   });

   await waitFor(() => {
       expect(screen.getByText('Test Product')).toBeInTheDocument();
   });
   ```

2. **API Mock Patterns**
   ```typescript
   // Success case
   productApi.searchProducts.mockResolvedValue({ products: mockProducts });

   // Error case
   productApi.searchProducts.mockRejectedValue(new Error('Failed to load'));
   ```

### Component Testing

1. **Test Loading States**
   ```typescript
   it('shows loading state', async () => {
       productApi.searchProducts.mockImplementation(() => 
           new Promise(resolve => setTimeout(resolve, 100))
       );
       render(<ProductSearch />);
       expect(screen.getAllByTestId('product-skeleton')).toHaveLength(6);
   });
   ```

2. **Test Empty States**
   ```typescript
   it('shows empty state', async () => {
       productApi.searchProducts.mockResolvedValue({ products: [] });
       render(<ProductSearch />);
       await waitFor(() => {
           expect(screen.getByText('No products found')).toBeInTheDocument();
       });
   });
   ```

3. **Test Error States**
   ```typescript
   it('handles errors', async () => {
       const error = new Error('Failed to load');
       productApi.searchProducts.mockRejectedValue(error);
       const consoleSpy = vi.spyOn(console, 'error');
       render(<ProductSearch />);
       await waitFor(() => {
           expect(consoleSpy).toHaveBeenCalledWith('Failed to load products:', error);
       });
   });
   ```

## Best Practices

1. **Test Isolation**
   - Reset store state before each test
   - Clear all mocks before each test
   - Don't let tests affect each other

2. **Mock Minimally**
   - Only mock external dependencies
   - Use real implementations where possible
   - Mock at the lowest level necessary

3. **Test Real User Scenarios**
   - Test loading, success, and error states
   - Test user interactions
   - Test edge cases

4. **Async Testing**
   - Always use `act` for state updates
   - Use `waitFor` for async operations
   - Handle promises properly

5. **Type Safety**
   - Use proper TypeScript types for mocks
   - Ensure mock data matches real data structure
   - Let TypeScript catch invalid test scenarios

## Common Pitfalls to Avoid

1. **Over-mocking**
   - Don't mock the store unless absolutely necessary
   - Don't mock internal implementation details
   - Mock only external dependencies

2. **Incomplete Reset**
   - Always reset store state completely
   - Clear all mocks before each test
   - Reset any global state that tests might affect

3. **Missing Async Handling**
   - Always wrap state updates in `act`
   - Use `waitFor` for async operations
   - Handle all promises properly

4. **Brittle Tests**
   - Don't test implementation details
   - Test user-facing behavior
   - Write tests that are resilient to refactoring

## Conclusion

Testing React components with Zustand stores is most effective when:
- Using real store implementation
- Mocking only external dependencies
- Properly handling async operations
- Following proper test isolation practices
- Testing from a user's perspective 

# Testing React Components with Form Libraries

## Form Testing Best Practices

### Mock Structure
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

### Key Learnings
1. **Complete Mocking**: Mock all necessary exports (useForm, useFormContext, FormProvider, Controller)
2. **Flexible Mocks**: Use vi.fn() to allow per-test modifications
3. **State Management**: Include all form state and methods components might use
4. **Test Coverage**:
   - Happy paths (successful operations)
   - Error cases (API failures, validation errors)
   - UI interactions
   - Component integration
   - Different user states
   - Form validation
   - API integration

### Best Practices
1. Use proper form testing utilities
2. Mock API responses consistently
3. Test error boundaries
4. Test loading states
5. Test user interactions thoroughly
6. Structure mocks to be flexible
7. Test both success and failure scenarios
8. Verify error messages and UI updates
9. Test component integration points
10. Document test scenarios

### Common Issues & Solutions
1. **ResizeObserver Mock**:
```typescript
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
vi.stubGlobal('ResizeObserver', mockResizeObserver);
```

2. **State Updates**:
```typescript
await act(async () => {
    render(<YourComponent />);
});
```

## Lessons Learned
1. Always provide complete mocks for form libraries
2. Test component integration points thoroughly
3. Document expected props and their shapes
4. Include error boundary testing
5. Structure mocks to be flexible
6. Cover both success and error scenarios
7. Test UI updates and error messages
8. Verify form validation behavior 