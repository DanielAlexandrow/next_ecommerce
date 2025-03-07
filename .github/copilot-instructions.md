Here’s a simplified version of the instructions file, retaining all context while removing unnecessary syntax, comments, and repetitive formatting. The structure is streamlined for clarity.
Restrictions
Never modify database migrations without user permission.
Never change API routes without user permission.
Project Overview
This is a Laravel project with the following models, routes, controller template, and database schema.
Models
AddressInfo
Namespace: App\Models
Fillable: name, email, postcode, city, country, street
Relationships:
user: HasOne (User, id_address_info)
Brand
Namespace: App\Models
Timestamps: False
Fillable: name
Relationships:
products: HasMany (Product)
Cart
Namespace: App\Models
Table: cart
Fillable: user_id
Relationships:
user: HasOne (User)
cartitems: HasMany (CartItem)
CartItem
Namespace: App\Models
Table: cart_item
Fillable: cart_id, subproduct_id, quantity
Relationships:
subproduct: BelongsTo (Subproduct)
Category
Namespace: App\Models
Table: categories
Timestamps: False
Fillable: name
Relationships:
navigationItems: BelongsToMany (NavigationItem)
products: BelongsToMany (Product, product_categories)
CategoryNavigationItem
Namespace: App\Models
Table: category_navigation_item
Fillable: category_id, navigation_item_id, description
Relationships:
category: BelongsTo (Category)
navigationItem: BelongsTo (NavigationItem)
Coordinate
Namespace: App\Models
Fillable: user_id, latitude, longitude
Relationships:
user: BelongsTo (User)
Guest
Namespace: App\Models
Fillable: id_address_info
Relationships:
addressInfo: BelongsTo (AddressInfo, id_address_info)
orders: HasMany (Order, guest_id)
Header
Namespace: App\Models
Table: headers
Timestamps: False
Fillable: name, description, order_num
Relationships:
navigationItems: HasMany (NavigationItem)
Image
Namespace: App\Models
Table: images
Fillable: name, path
Appends: full_path (storage/ + path)
Relationships:
products: BelongsToMany (Product, product_images, with order_num)
NavigationItem
Namespace: App\Models
Table: navigation_item
Timestamps: False
Fillable: name, order_num, description
Relationships:
header: BelongsTo (Header)
categories: BelongsToMany (Category)
Order
Namespace: App\Models
Table: orders
Fillable: user_id, guest_id
Relationships:
user: BelongsTo (User)
orderItems: HasMany (OrderItem)
guest: BelongsTo (Guest)
OrderItem
Namespace: App\Models
Fillable: order_id, subproduct_id, quantity
Relationships:
order: BelongsTo (Order)
subproduct: BelongsTo (Subproduct)
Product
Namespace: App\Models
Table: products
Fillable: name, description, discount, original_price, available, brand_id
Casts: available (boolean), discount (float), original_price (float)
With: images, categories, brand, subproducts, reviews
Appends: average_rating (average of reviews.rating or 0)
Relationships:
subproducts: HasMany (Subproduct, product_id)
images: BelongsToMany (Image, product_images, with order_num)
categories: BelongsToMany (Category, product_categories)
brand: BelongsTo (Brand)
reviews: HasMany (Review)
ProductCategory
Namespace: App\Models
Table: product_categories
Timestamps: False
Fillable: product_id, category_id
Relationships:
product: BelongsTo (Product)
category: BelongsTo (Category)
ProductImage
Namespace: App\Models
Table: product_images
Timestamps: False
Fillable: product_id, image_id, order_num
Relationships:
product: BelongsTo (Product, product_id)
image: BelongsTo (Image, image_id)
Review
Namespace: App\Models
Fillable: user_id, product_id, title, content, rating
Relationships:
user: BelongsTo (User)
product: BelongsTo (Product)
ShopSettings
Namespace: App\Models
Fillable: currency, mapbox_api_key, sendgrid_api_key, shop_name, shop_logo
Subproduct
Namespace: App\Models
Table: subproducts
Timestamps: False
Fillable: name, price, product_id, available
Relationships:
product: BelongsTo (Product, product_id)
images: HasMany (SubproductImage, subproduct_id)
User
Namespace: App\Models
Fillable: username, name, email, password, id_address_info, role
Hidden: password, remember_token
Casts: email_verified_at (datetime)
Methods:
avatar: Returns Gravatar URL based on email
isAdmin: Returns true if role is admin
isDriver: Returns true if role is driver
Relationships:
addressInfo: HasOne (AddressInfo, id, id_address_info)
orders: HasMany (Order, user_id)
coordinate: HasOne (Coordinate)
Routes (web.php)
Authenticated Routes (middleware: auth)
Images: /images (index, store, destroy), /getallimages, /getImagesPaginated
Products: /products (index, create, store, destroy, update, show), /product/{product_id}, /products/{product}/reviews (GET, POST)
Subproducts: /subproducts (store, update, destroy), /subproducts/byproduct/{product_id}
Categories: /categories (index, store)
Navigation: /navigation (index, store, update), /navigation/getnavdata
Orders: /orders (index), /orders/getitems/{order_id}
Brands: /brands (index, store, update, destroy), /brands/getallbrands
User Profile: 
/profile/adressinfo, /profile/updateadress (POST)
/profile/orders, /profile/orders/getitems/{order_id}
/profile/password (GET, POST)
Shop Settings: /shop-settings (GET), /api/shop-settings (POST)
Reviews: /reviews/{review} (PUT, DELETE)
Driver Routes (middleware: role:driver):
/driver/coordinates (GET, POST)
/driver/orders
/driver/coordinates/current
Public Routes
/productsearch
/orders/generatepdf/{orderId} (POST)
Cart: /cart/add (POST), /cart/remove (POST), /cart, /getcartitems
Checkout: /checkout/{cartId} (POST)
/store/products/search
Includes
features.php, auth.php
Controller Template
Use a service class for logic.
Example ProductController:
Namespace: App\Http\Controllers
Dependencies: ProductServiceInterface (injected via constructor)
Methods:
index: Returns Inertia view admin/ProductList with paginated products, sort key, and direction
create: Returns Inertia view admin/NewProduct
store: Creates product via service, returns JSON (201)
update: Updates product via service, returns JSON (200)
destroy: Deletes product via service, returns JSON (204)

Database Schema
Tables
users: id, name, username (nullable), email (unique), email_verified_at (nullable), password, role (enum: admin, driver, customer, default: customer), remember_token, timestamps
password_resets: email (index), token, created_at (nullable)
failed_jobs: id, uuid (unique), connection, queue, payload, exception, failed_at
personal_access_tokens: id, tokenable (morphs), name, token (unique), abilities (nullable), last_used_at (nullable), expires_at, timestamps
coordinates: id, user_id (foreign, cascade), latitude (decimal), longitude (decimal), address (nullable), timestamps
categories: id, name, description (nullable), slug (unique), parent_id (foreign, nullable, set null), order_num (default: 0), timestamps
brands: id, name, description (nullable), timestamps
products: id, name, description, available (boolean, default: true), brand_id (foreign), metadata (json, nullable), timestamps
reviews: id, rating, comment, product_id (foreign, cascade), user_id (foreign), timestamps
roles: id, name, guard_name (default: web), timestamps
model_has_roles: role_id (foreign, cascade), model (morphs), primary key (role_id, model_id, model_type)
subproducts: id, name, price (decimal), available (boolean, default: true), stock (default: 0), product_id (foreign, cascade), sku (unique), metadata (json, nullable), weight (decimal, nullable), dimensions (json, nullable), timestamps
search_histories: id, user_id (foreign, cascade), search_term, searched_at, timestamps
chat_messages: id, content, user_id (foreign, cascade), sender (morphs), timestamps
address_infos: id, name, address, city, postal_code, country, phone, timestamps
orders: id, user_id (foreign, nullable, set null), driver_id (foreign, nullable, set null), total (decimal, default: 0), status (default: pending), payment_status (default: pending), shipping_status (default: pending), items (jsonb, default: []), shipping_address (jsonb, nullable), billing_address (jsonb, nullable), timestamps
order_items: id, order_id (foreign, cascade), subproduct_id (foreign, restrict), quantity, price (decimal), timestamps
search_history: id, user_id (foreign, cascade), search_term, timestamps, indexes (user_id, created_at, search_term)
guests: id, id_address_info (foreign, cascade), email, phone, timestamps
popular_searches: id, search_term (unique), count (default: 1), timestamps, index (count)
images: id, name, path, timestamps
product_images: id, product_id (foreign, cascade), image_id (foreign, cascade), order_num (nullable)
product_categories: id, product_id (foreign, cascade), category_id (foreign, cascade)
headers: id, name, order_num
navigation_item: id, name, order_num, header_id (foreign)
category_navigation_item: id, description (nullable), category_id (foreign, cascade), navigation_item_id (foreign, cascade), timestamps
carts: id, user_id (foreign, cascade, nullable), session_id (nullable, index), total (decimal, default: 0), currency (default: USD), status (enum: active, abandoned, converted, default: active), last_activity, timestamps, softDeletes, indexes (status, last_activity)
cart_items: id, cart_id (foreign, cascade), subproduct_id (foreign, cascade), quantity (default: 1), timestamps
shop_settings: id, currency (default: LEV), mapbox_api_key (nullable), sendgrid_api_key (nullable), shop_name (default: My Shop, nullable), shop_logo (nullable), timestamps
This simplified version preserves all essential details while eliminating redundant syntax and formatting. Let me know if further adjustments are needed!