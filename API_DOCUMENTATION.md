# API Documentation

## Authentication

### Types
1. **Session-based Authentication**
   - Used for web routes
   - Managed through Laravel's built-in authentication system
   - CSRF protection enabled

2. **Token-based Authentication (Sanctum)**
   - Used for API routes
   - Bearer token authentication
   - Tokens created upon login

### Authentication Routes
- `POST /login` - Regular user login
- `POST /adminlogin` - Admin login (validates admin role)
- `POST /register` - User registration
- `POST /logout` - Logout
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset
- `GET /verify-email` - Show email verification notice
- `GET /verify-email/{id}/{hash}` - Verify email
- `POST /email/verification-notification` - Resend verification email

## Role-Based Access

### Roles
1. **Admin**
   - Full system access
   - Protected by AdminMiddleware
   - Product and category management
   - User management
   - Order management

2. **Driver**
   - Access to driver-specific routes
   - Protected by role:driver middleware
   - Location tracking
   - Order delivery management

3. **Customer**
   - Product browsing
   - Cart management
   - Order placement
   - Review management (with purchase verification)

## API Endpoints

### Public Routes
- `GET /navigation/getnavdata` - Get navigation structure
- `GET /store/productsearch` - Search products
- `GET /api/products/search` - Product search API with filters
  - Parameters:
    - name: string (optional)
    - minPrice: number (optional)
    - maxPrice: number (optional)
    - sortBy: newest|price_asc|price_desc|name_asc|name_desc|rating_desc
    - page: number
- `GET /categoryservice` - Get categories with product count
- `GET /productsnav/{navigationItemId}` - Get products by navigation

### Cart & Checkout
- `POST /cart/add` - Add item to cart
  - Required: subproduct_id
  - Returns: Updated cart items
- `POST /cart/remove` - Remove item from cart
  - Required: subproduct_id
- `GET /cart` - Get cart page with items
- `GET /getcartitems` - Get cart items (JSON)
- `POST /checkout/{cartId}` - Process checkout
  - Validates address information
  - Creates order
  - Handles guest checkout

### Admin Routes (Protected)
```
Prefix: /admin
Middleware: auth, admin
```

#### Shop Management
- `GET /shop-settings` - Shop settings page
- `POST /api/shop-settings` - Update shop settings
  - Validates: currency, mapbox_api_key, sendgrid_api_key, shop_name, shop_logo
- `Resource /products` - Product CRUD
  - Includes validation for name, description, brand_id, categories, metadata
- `Resource /brands` - Brand CRUD
- `GET /categories` - Category management
- `GET /users` - User management
  - Includes pagination and sorting

#### Order Management
- `GET /orders` - List orders with filtering and sorting
  - Parameters: sortkey, sortdirection, search, driver_id
- `GET /orders/{order_id}` - Detailed order information
- `PUT /orders/{order}/status` - Update order status
  - Validates: status, payment_status, shipping_status, driver_id
- `GET /orders/generatepdf/{orderId}` - Generate order PDF
  - Secured for admin and order owner access

### User Routes (Protected)
```
Middleware: auth
```

#### Profile Management
- `GET /profile/adressinfo` - Get address information
- `POST /profile/updateadress` - Update address
  - Validates: name, postcode, city, country, email, street
- `GET /profile/orders` - Order history page
- `GET /profile/orders/get` - Get user orders (JSON)
- `GET /profile/orders/getitems/{orderId}` - Get order details
  - Secured to order owner
- `GET /profile/password` - Password settings page
- `POST /profile/password` - Update password
  - Validates: current_password, new_password, new_password_repeated

#### Reviews
- `GET /products/{product}/reviews` - Get product reviews
  - Parameters: 
    - sortBy: created_at|rating
    - sortOrder: asc|desc
    - page: number (pagination)
  - Response includes:
    - reviews: paginated review data
    - average_rating
    - total_reviews
- `POST /products/{product}/reviews` - Create review
  - Requires:
    - Authentication
    - Purchase verification
  - Validates:
    - title: required, string, max:100
    - content: optional, string, max:1000
    - rating: required, integer, 1-5
  - Returns:
    - 201: Review created successfully
    - 403: No purchase verification
    - 422: Validation errors
- `PUT /reviews/{review}` - Update review
  - Secured to review owner
  - Same validation as POST
  - Returns 403 if not owner
- `DELETE /reviews/{review}` - Delete review
  - Secured to review owner
  - Returns 403 if not owner

### Driver Routes (Protected)
```
Middleware: auth, role:driver
```

- `GET /driver/coordinates` - Get driver coordinates page
- `GET /driver/orders` - Get assigned orders page
- `GET /api/drivers` - List available drivers
- `POST /driver/coordinates` - Store driver location
- `GET /driver/coordinates/current` - Get current coordinates
- `PUT /driver/coordinates` - Update driver location

## Response Formats

### Success Responses
- 200: Standard success
- 201: Resource created
- 204: No content (successful deletion)

### Error Responses
```json
{
    "message": "Error message",
    "errors": {
        "field": ["Validation error details"]
    }
}
```

### Headers
- `X-Message`: Used for success messages
- `X-CSRF-TOKEN`: Required for non-GET requests
- `Authorization`: Bearer token for API routes

## Security Measures

### Request Validation
- All input validated using Laravel Request classes
- Custom validation rules for specific endpoints
- Consistent error response format

### Authorization
- Role-based middleware
- Resource ownership verification
- CSRF protection on all web routes
- Rate limiting on API routes (60 requests/minute)

### Data Protection
- Password hashing
- Email verification
- Secure password reset flow
- Session management

## Testing
1. Feature Tests
   - Controller actions
   - Middleware functionality
   - Route protection
   
2. Unit Tests
   - Service classes
   - Model relationships
   - Helper functions

3. Integration Tests
   - Complete workflows
   - Cross-component functionality
   - Database interactions




















   dd





