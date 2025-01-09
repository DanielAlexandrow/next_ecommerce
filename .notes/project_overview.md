# Project Overview

## Architecture

### Frontend
- React with TypeScript
- React Hook Form for form management
- Component structure:
  - Admin/
    - ProductForm/
      - ProductForm.tsx (main form component)
      - BrandSelect.tsx (brand selection component)
      - CategorySelect.tsx (category selection component)
      - ImageSelect.tsx (image selection component)

### Backend
- PHP/Laravel
- Key components:
  - ProductController
  - Product Model
  - ProductOrder Model
  - Tests:
    - Unit tests for controllers and models
    - Feature tests for product creation and ordering

## Testing Strategy

### Frontend Tests (Vitest)
- Component tests using @testing-library/react
- Mock strategy:
  - Child components mocked to prevent network requests
  - Form context mocked for controlled testing
  - Axios mocked for API calls

### Backend Tests (PHPUnit)
- Unit tests for business logic
- Feature tests for end-to-end functionality
- Database transactions for test isolation

## Current Focus
- Stabilizing ProductForm tests
- Improving test coverage for edge cases
- Ensuring proper mocking of dependencies 