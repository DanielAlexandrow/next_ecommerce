<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\SubproductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\NavigationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AdminOrders;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ShopSettingsController;

use App\Http\Controllers\Store\ProductSearchController;
use App\Http\Controllers\Store\StoreProductController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\UserAdressInfoController;
use App\Http\Controllers\Store\UserOrdersController;
use App\Http\Controllers\Store\UserPasswordController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\DriverOrderController;
use App\Http\Controllers\CoordinateController;

// Public routes - no auth required
Route::get('/', function () {
    return redirect('/productsearch');
});

Route::middleware(['validate.params'])->group(function () {
    // Navigation and categories
    Route::get('/navigation/getnavdata', [NavigationController::class, 'getNavigationData']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/brands/getallbrands', [BrandController::class, 'getAllBrands']);
    
    // Product search and browsing
    Route::get('/store/productsearch', [ProductSearchController::class, 'index']);
    Route::get('/api/products/search', [ProductSearchController::class, 'search']);
    Route::get('/productsnav/{navigationItemId}', [ProductSearchController::class, 'getProductsByNavigationItem'])
        ->where('navigationItemId', '[0-9]+');
        
    // Product details
    Route::get('/product/{product_id}', [StoreProductController::class, 'index'])
        ->where('product_id', '[0-9]+');
    Route::get('/products/{product}/reviews', [ReviewController::class, 'index'])
        ->where('product', '[0-9]+');
        
    // Cart operations
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/remove', [CartController::class, 'remove']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::get('/getcartitems', [CartController::class, 'getCartItems']);
    Route::get('/cart/withdeals', [CartController::class, 'getCartWithDeals']);
});

// Admin routes
Route::middleware(['auth', 'admin'])->group(function () {
    // Dashboard and settings
    Route::get('/shop-settings', [ShopSettingsController::class, 'index'])->name('admin.dashboard');
    Route::post('/api/shop-settings', [ShopSettingsController::class, 'update']);
    
    // Product management
    Route::resource('/products', ProductController::class);
    Route::post('/api/products', [ProductController::class, 'store']);
    Route::put('/api/products/{id}', [ProductController::class, 'update']);
    Route::delete('/api/products/{id}', [ProductController::class, 'destroy']);
    
    // Brand management
    Route::resource('/brands', BrandController::class);
    
    // Category management
    Route::get('/admin/categories', function () {
        return inertia('admin/CategoryManagement');
    })->name('admin.categories');
    

    // User management
    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users');
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    
    // Navigation management
    Route::resource('/navigation', NavigationController::class)->only(['index', 'store']);
    Route::put('/navigation', [NavigationController::class, 'update']);
    
    // Order management
    Route::resource('/orders', AdminOrders::class)->only(['index']);
    Route::get('/orders/getitems/{order}', [AdminOrders::class, 'getOrderDetails']);
    Route::put('/orders/{order}/status', [AdminOrders::class, 'updateStatus']);

    // Deal management
    Route::get('/admin/deals', [DealController::class, 'index'])->name('admin.deals');
    Route::post('/api/deals', [DealController::class, 'store']);
    Route::put('/api/deals/{deal}', [DealController::class, 'update']);
    Route::delete('/api/deals/{deal}', [DealController::class, 'destroy']);
    Route::get('/api/deals/active', [DealController::class, 'getActiveDeals']);
});

// Authenticated user routes
Route::middleware(['auth'])->group(function () {
    // Store
    Route::get('/productsearch', [ProductSearchController::class, 'index']);
    
    // Profile management
    Route::get('/profile/adressinfo', [UserAdressInfoController::class, 'index']);
    Route::post('/profile/updateadress', [UserAdressInfoController::class, 'store']);
    Route::get('/profile/password', [UserPasswordController::class, 'index']);
    Route::post('/profile/password', [UserPasswordController::class, 'update']);
    
    // Orders
    Route::get('/profile/orders', [UserOrdersController::class, 'index']);
    Route::get('/profile/orders/get', [UserOrdersController::class, 'getUserOrders']);
    Route::get('/profile/orders/getitems/{orderId}', [UserOrdersController::class, 'getOrderDetails'])
        ->where('orderId', '[0-9]+');
    Route::get('/orders/generatepdf/{orderId}', [AdminOrders::class, 'generatePdf'])
        ->where('orderId', '[0-9]+');
    
    // Reviews
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store'])
        ->where('product', '[0-9]+');
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])
        ->where('review', '[0-9]+');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])
        ->where('review', '[0-9]+');
    
    // Checkout
    Route::post('/checkout/{cartId}', [CheckoutController::class, 'checkout'])
        ->where('cartId', '[0-9]+');
});

// Driver routes
Route::middleware(['auth', 'role:driver'])->group(function () {
    Route::get('/driver/coordinates', [DriverController::class, 'index']);
    Route::get('/driver/orders', [DriverOrderController::class, 'index'])->name('driver.orders');
    Route::get('/api/drivers', [DriverController::class, 'getDrivers']);
    
    // Coordinates
    Route::post('/driver/coordinates', [CoordinateController::class, 'store']);
    Route::get('/driver/coordinates/current', [CoordinateController::class, 'show']);
    Route::put('/driver/coordinates', [CoordinateController::class, 'update']);
});

// Fallback route
Route::fallback(function () {
    if (request()->expectsJson()) {
        return response()->json(['message' => 'Not Found', 'error' => 'The requested endpoint does not exist.'], 404);
    }
    return response()->view('errors.404', [], 404);
});

// Include additional route files
require __DIR__ . '/features.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/profile.php';
