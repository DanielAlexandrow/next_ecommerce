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

// Public routes
Route::get('/', function () {
    return redirect('/productsearch');
});

Route::get('/navigation/getnavdata', [NavigationController::class, 'getNavigationData']);
Route::get('/store/productsearch', [ProductSearchController::class, 'index']);
Route::get('/api/products/search', [ProductSearchController::class, 'search']);
Route::get('/categoryservice', [CategoryController::class, 'index']);
Route::get('/productsnav/{navigationItemId}', [ProductSearchController::class, 'getProductsByNavigationItem']);

// Reviews - public route for viewing
Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);

// Cart routes
Route::post('/cart/add', [CartController::class, 'add']);
Route::post('/cart/remove', [CartController::class, 'remove']);
Route::get('/cart', [CartController::class, 'index']);
Route::get('/getcartitems', [CartController::class, 'getCartItems']);

// Checkout routes
Route::post('/checkout/{cartId}', [CheckoutController::class, 'checkout']);

// Authenticated admin routes
Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/shop-settings', [ShopSettingsController::class, 'index'])->name('admin.dashboard');
    Route::resource('/products', ProductController::class);
    Route::resource('/brands', BrandController::class);
    Route::get('/admin/categories', function () {
        return inertia('admin/CategoryManagement');
    })->name('admin.categories');

    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users');
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::resource('/navigation', NavigationController::class)->only(['index', 'store', 'update']);
    Route::resource('/orders', AdminOrders::class)->only(['index']);
    Route::get('/orders/getitems/{order_id}', [AdminOrders::class, 'getOrderDetails']);
    Route::put('/orders/{order}/status', [AdminOrders::class, 'updateStatus']);

    // Admin API routes
    Route::prefix('api')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/orders/{order}/status', [AdminOrders::class, 'updateStatus']);
        Route::get('/orders', [AdminOrders::class, 'index']);
        Route::get('/orders/{order_id}', [AdminOrders::class, 'getOrderDetails']);
        Route::post('/shop-settings', [ShopSettingsController::class, 'update']);
    });
});

// Regular authenticated user routes
Route::middleware(['auth'])->group(function () {
    // Store routes
    Route::get('/productsearch', [ProductSearchController::class, 'index']);
    Route::get('/product/{product_id}', [StoreProductController::class, 'index']);
    
    // User profile routes
    Route::get('/profile/adressinfo', [UserAdressInfoController::class, 'index']);
    Route::post('/profile/updateadress', [UserAdressInfoController::class, 'store']);
    Route::get('/profile/orders', [UserOrdersController::class, 'index']);
    Route::get('/profile/orders/get', [UserOrdersController::class, 'getUserOrders']);
    Route::get('/profile/orders/getitems/{orderId}', [UserOrdersController::class, 'getOrderDetails']);
    Route::get('/profile/orders/generatepdf/{orderId}', [AdminOrders::class, 'generatePdf']);
    Route::get('/profile/password', [UserPasswordController::class, 'index']);
    Route::post('/profile/password', [UserPasswordController::class, 'update']);

    // Reviews - authenticated routes for managing reviews
    Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
});

// Driver routes
Route::middleware(['auth', 'role:driver'])->group(function () {
    Route::get('/driver/coordinates', [DriverController::class, 'index']);
    Route::get('/driver/orders', [DriverOrderController::class, 'index'])->name('driver.orders');
    Route::get('/api/drivers', [DriverController::class, 'getDrivers']);
    Route::post('/driver/coordinates', [CoordinateController::class, 'store']);
    Route::get('/driver/coordinates/current', [CoordinateController::class, 'show']);
    Route::put('/driver/coordinates', [CoordinateController::class, 'update']);
});

// Fallback route
Route::fallback(function () {
    if (request()->expectsJson()) {
        return response()->json([
            'message' => 'Not Found',
            'error' => 'The requested endpoint does not exist.'
        ], 404);
    }
    return response()->view('errors.404', [], 404);
});

require __DIR__ . '/features.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/profile.php';
