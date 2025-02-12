# Frontend Test Memory Bank

## Active Test Iterations

### Current Focus
```json
{
  "current_test": "test_product_form_renders_create_mode",
  "status": "ready_to_start",
  "last_successful_state": null,
  "safe_rollback_point": "HEAD",
  "context": {
    "framework": "Vitest",
    "component": "ProductForm",
    "dependencies": [
      "@testing-library/react",
      "@testing-library/jest-dom",
      "vitest"
    ],
    "setup_requirements": [
      "Clear existing tests",
      "Setup test environment",
      "Mock API endpoints",
      "Prepare test data"
    ]
  }
}
```

### Test Queue
```json
{
  "planned_tests": [
    {
      "name": "test_product_form_renders_create_mode",
      "priority": "high",
      "dependencies": [
        "React Testing Library",
        "ProductForm component",
        "API mocks"
      ],
      "estimated_risk": "low",
      "description": "Test basic form rendering in create mode",
      "status": "in_progress"
    }
  ],
  "completed_tests": []
}
```

## Test Implementation Patterns

### 1. Component Test Structure
```javascript
// Standard test structure
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should render correctly', () => {
    // Test
  });
});
```

### 2. Testing Patterns
```json
{
  "render_tests": {
    "initial_state": {
      "check_elements": [
        "Form fields presence",
        "Default values",
        "Button states"
      ]
    },
    "user_interactions": {
      "events": [
        "Input changes",
        "Form submission",
        "Button clicks"
      ]
    },
    "api_integration": {
      "mocks": [
        "Success responses",
        "Error handling",
        "Loading states"
      ]
    }
  }
}
```

### 3. Mock Patterns
```javascript
// API Mock Template
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));
```

## Quick Commands
```bash
# Run single test
pnpm test -- -t "test name"
````

# Run tests in watch mode
npm test -- --watch

# Update snapshots
npm test -- -u

# Run with coverage
pnpm test -- --coverage
```
