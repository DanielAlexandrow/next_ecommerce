# Testing Guidelines for React Components with Vitest

## Setup Requirements

- Vitest
- React Testing Library
- JSDOM for browser environment simulation

## Common Issues & Solutions

### 1. ResizeObserver Mock

When testing components that use UI libraries (like shadcn/ui), you need to mock ResizeObserver:

```typescript
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);
```

### 2. State Updates in Tests

Always wrap component rendering and state updates in `act()`:

```typescript
await act(async () => {
    render(<YourComponent />);
});

await act(async () => {
    fireEvent.click(button);
});
```

### 3. Form Library Testing

When testing components that use form libraries (like react-hook-form), provide complete mocks:

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

Key points for form testing:
- Mock all necessary exports (useForm, useFormContext, FormProvider, Controller)
- Use vi.fn() for mocks to allow per-test modifications
- Include all form state and methods components might use
- Test both validation success and failure cases

### 4. Test Coverage Strategy

Ensure comprehensive testing by covering:
- Happy paths (successful operations)
- Error cases (API failures, validation errors)
- UI interactions (buttons, forms, modals)
- Component integration points
- Different user states (guest/logged in)
- Form validation scenarios
- API integration points

### 5. Best Practices

1. Use proper form testing utilities
2. Mock API responses consistently
3. Test error boundaries
4. Test loading states
5. Test user interactions thoroughly
6. Structure mocks to allow per-test modifications
7. Test both success and failure scenarios
8. Verify error messages and UI updates
9. Test component integration points
10. Document test scenarios and mock structures

## Lessons Learned

1. Always provide complete mocks for form libraries
2. Test component integration points thoroughly
3. Document expected props and their shapes
4. Include error boundary testing in test suites
5. Structure mocks to be flexible and modifiable
6. Cover both success and error scenarios
7. Test UI updates and error messages
8. Verify form validation behavior

## Next Steps

1. Fix react-hook-form mock
2. Add missing test cases
3. Implement error boundaries
4. Improve test documentation 