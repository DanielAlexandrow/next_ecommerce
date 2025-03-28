# Test Suite for .github/copilot-instructions.md

## Test: Verify Restrictions Section
- Check if the "Restrictions" heading exists.
- Check if "Never modify database migrations without user permission." text exists.
- Check if "Never change API routes without user permission." text exists.

## Test: Verify Project Overview Section
- Check if the "Project Overview" heading exists.
- Check if "This is a Laravel project..." text exists.

## Test: Verify Models Section
- Check if the "Models" heading exists.
- Check if "AddressInfo" model section exists.
    - Check if "Namespace: App\Models" exists under AddressInfo.
    - Check if "Fillable: name, email, postcode, city, country, street" exists under AddressInfo.
    - Check if "user: HasOne (User, id_address_info)" relationship exists under AddressInfo.
- Check if "Product" model section exists.
    - Check if "Namespace: App\Models" exists under Product.
    - Check if "Table: products" exists under Product.
    - Check if "Fillable: name, description, available, brand_id" exists under Product.
    - Check if "subproducts: HasMany (Subproduct, product_id)" relationship exists under Product.
- Check if "User" model section exists.
    - Check if "Namespace: App\Models" exists under User.
    - Check if "Fillable: username, name, email, password, id_address_info, role" exists under User.
    - Check if "isAdmin: Returns true if role is admin" method exists under User.
    - Check if "addressInfo: HasOne (AddressInfo, id, id_address_info)" relationship exists under User.

## Test: Verify Routes Section
- Check if the "Routes (web.php)" heading exists.
- Check if "Authenticated Routes (middleware: auth)" subheading exists.
- Check if "Products: /products (index, create, store, destroy, update, show)..." exists under Authenticated Routes.
- Check if "Public Routes" subheading exists.
- Check if "Cart: /cart/add (POST), /cart/remove (POST), /cart, /getcartitems" exists under Public Routes.

## Test: Verify Controller Template Section
- Check if the "Controller Template" heading exists.
- Check if "Use a service class for logic." text exists.
- Check if "Example ProductController:" exists.
    - Check if "Namespace: App\Http\Controllers" exists under ProductController example.
    - Check if "Dependencies: ProductServiceInterface (injected via constructor)" exists under ProductController example.
    - Check if "index: Returns Inertia view admin/ProductList..." exists under ProductController example.

## Test: Verify Database Schema Section
- Check if the "Database Schema" heading exists.
- Check if the "Tables" subheading exists.
- Check if "users: id, name, username (nullable), email (unique)..." table definition exists.
- Check if "products: id, name, description, available (boolean, default: true)..." table definition exists.
- Check if "orders: id, user_id (foreign, nullable, set null)..." table definition exists.
- Check if "cart_items: id, cart_id (foreign, cascade), subproduct_id (foreign, cascade)..." table definition exists.