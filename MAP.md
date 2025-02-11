# Documentation Map

## Core Documentation Files
1. `LESSONS.md`
   - Location: Root directory
   - Contains: 
     - Lessons learned from development
     - Test results and coverage
     - Database migration issues
     - API design decisions
     - Best practices
     - Test iteration strategy
     - Context-aware testing strategy
     - Refinement checklists
     - Environmental requirements

2. `MEMORY_BANK.md`
   - Location: Root directory
   - Contains:
     - Active test iterations
     - Test queue management
     - Failure history with context
     - Success patterns
     - Context patterns
     - Test running protocols
     - Environment states
     - Quick reference commands
     - Recovery procedures

3. `README.md` (Laravel default)
   - Location: Root directory
   - Contains:
     - Project setup instructions
     - Basic configuration
     - Development guidelines

## Test Documentation Structure
1. Unit Tests
   - Location: `/tests/Unit/`
   - Key files:
     - `Services/ProductServiceTest.php`
       - Product service layer tests
       - Mocking patterns
       - Service context examples
     - `Models/NavigationItemTest.php`
       - Relationship testing
       - Model validation
     - `Controllers/CategoryControllerTest.php`
       - CRUD operations
       - Request validation
       - Response formatting

2. Feature Tests
   - Location: `/tests/Feature/`
   - Key files:
     - `Auth/EmailVerificationTest.php`
       - Authentication flow
       - Email verification process
     - `ExampleTest.php`
       - Basic test setup
       - Testing conventions

## API Documentation
1. Controller Documentation
   - Location: `/app/Http/Controllers/`
   - Key endpoints documented in:
     - `Store/StoreProductController.php`
       - Product management
       - Inventory operations
     - `CartController.php`
       - Shopping cart functionality
       - Order processing
     - `ProfileController.php`
       - User profile management
       - Settings handling

## Database Documentation
1. Migration Files
   - Location: `/database/migrations/`
   - Key schemas:
     - `2024_04_04_090749_productcategory.php`
       - Product-category relationships
       - Indexing strategy
     - `2024_01_20_000000_create_orders_table.php`
       - Order management
       - Transaction tracking

2. Seeders
   - Location: `/database/seeders/`
   - Contains test data setup in:
     - `AdminSeeder.php`
       - Admin user creation
       - Role assignment
     - Other related seeders
       - Product data
       - Category hierarchies

## Frontend Documentation
1. Component Documentation
   - Location: `/resources/js/components/`
   - Key components:
     - `Admin/ProductForm/ProductForm.tsx`
       - Product management UI
       - Form validation
       - State management
     - `resources/js/components/ui/date-range-picker.tsx`
       - Date range selection
       - Integration with form state

## Test Context Management
1. Environment Configurations
   - Location: Various config files
   - Purpose:
     - Test environment setup
     - Service mocking
     - Database configurations

2. Test Support Files
   - Location: `/tests/Support/`
   - Purpose:
     - Helper functions
     - Custom assertions
     - Mock data generators 
