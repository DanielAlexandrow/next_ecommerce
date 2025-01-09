# Project Directory Structure

## Frontend (React/TypeScript)

```
resources/js/
├── components/
│   ├── Admin/
│   │   ├── ProductForm/
│   │   │   ├── ProductForm.tsx
│   │   │   ├── BrandSelect.tsx
│   │   │   ├── CategorySelect.tsx
│   │   │   └── ImageSelect.tsx
│   │   ├── DeleteProductModal/
│   │   ├── DeleteSubproductModal/
│   │   └── NavigationMaker/
│   ├── Store/
│   │   ├── Cart/
│   │   ├── ProductCard/
│   │   └── ProductSearch/
│   └── ui/
│       ├── Button.tsx
│       ├── dialog.tsx
│       └── modal/
├── tests/
│   └── components/
│       ├── Admin/
│       │   ├── ProductForm/
│       │   │   ├── ProductForm.test.tsx
│       │   │   ├── BrandSelect.test.tsx
│       │   │   ├── CategorySelect.test.tsx
│       │   │   └── ImageSelect.test.tsx
│       │   └── NavigationMaker/
│       └── Store/
└── utils/
```

## Backend (PHP/Laravel)

```
app/
├── Http/
│   └── Controllers/
│       └── ProductController.php
├── Models/
│   ├── Product.php
│   └── ProductOrder.php
└── tests/
    ├── Feature/
    │   └── ProductCreationTest.php
    └── Unit/
        ├── Controllers/
        │   └── ProductControllerTest.php
        └── Models/
            └── ProductOrderTest.php
```

## Test Files

### Frontend Tests
- Total: 86 tests
- Status: 84 passing, 2 failing
- Key test files:
  - `ProductForm.test.tsx`
  - `BrandSelect.test.tsx`
  - `CategorySelect.test.tsx`
  - `ImageSelect.test.tsx`

### Backend Tests
- Total: 65 tests
- Status: All passing
- Key test files:
  - `ProductCreationTest.php`
  - `ProductControllerTest.php`
  - `ProductOrderTest.php`

## Important Files
1. `ProductForm.tsx` - Main product form component
2. `BrandSelect.tsx` - Brand selection component
3. `CategorySelect.tsx` - Category selection component
4. `ImageSelect.tsx` - Image selection component
5. `ProductController.php` - Main product controller
6. `Product.php` - Product model
7. `ProductOrder.php` - Product order model 