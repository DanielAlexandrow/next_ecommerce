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
Route::get('/productsearch', [ProductSearchController::class, 'index']);
Route::get('/api/products/search', [ProductSearchController::class, 'search']);
Route::get('/categoryservice', [CategoryController::class, 'index']);
Route::get('/productsnav/{navigationItemId}', [ProductSearchController::class, 'getProductsByNavigationItem']);

// Cart routes
Route::post('/cart/add', [CartController::class, 'add']);
Route::post('/cart/remove', [CartController::class, 'remove']);
Route::get('/cart', [CartController::class, 'index']);
Route::get('/getcartitems', [CartController::class, 'getcartitems']);

// Checkout routes
Route::post('/checkout/{cartId}', [CheckoutController::class, 'checkout']);

Route::middleware(['auth'])->group(function () {
	// Images routes
	Route::resource('/images', ImageController::class)->only(['index', 'store', 'destroy']);
	Route::get('/getallimages', [ImageController::class, 'getAllImages']);
	Route::get('/getImagesPaginated', [ImageController::class, 'getImagesPaginated']);

	// Products routes
	Route::get('/product/{product_id}', [StoreProductController::class, 'index']);

	Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);
	Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

	// Subproducts routes
	Route::resource('/subproducts', SubproductController::class)->only(['store', 'update', 'destroy']);
	Route::get('/subproducts/byproduct/{product_id}', [SubproductController::class, 'getSubproductsByProductId']);

	// Categories routes
	Route::prefix('categories')->group(function () {
		Route::get('/', [CategoryController::class, 'index']);
		Route::post('/', [CategoryController::class, 'store']);
		Route::put('/{id}', [CategoryController::class, 'update']);
		Route::delete('/{id}', [CategoryController::class, 'destroy']);
		Route::get('/search', [CategoryController::class, 'search']);
		Route::post('/bulk-delete', [CategoryController::class, 'bulkDelete']);
		Route::get('/hierarchy', [CategoryController::class, 'getHierarchy']);
	});

	Route::get('/admin/categories', function () {
		return inertia('admin/CategoryManagement');
	})->name('admin.categories');

	// Navigation management routes
	Route::resource('/navigation', NavigationController::class)->only(['index', 'store', 'update']);

	// Orders routes
	Route::resource('/orders', AdminOrders::class)->only(['index']);
	Route::get('/orders/getitems/{order_id}', [AdminOrders::class, 'getOrderDetails']);
	Route::get('/orders/generatepdf/{orderId}', [AdminOrders::class, 'generatePdf']);
	Route::put('/orders/{order}/status', [AdminOrders::class, 'updateStatus']);

	Route::resource('/brands', BrandController::class)->only(['index', 'store', 'update', 'destroy']);
	Route::get('/brands/getallbrands', [BrandController::class, 'getAllBrands']);

	// User profile routes
	Route::get('/profile/adressinfo', [UserAdressInfoController::class, 'index']);
	Route::post('/profile/updateadress', [UserAdressInfoController::class, 'store']);
	Route::get('/profile/orders', [UserOrdersController::class, 'index']);
	Route::get('/profile/orders/get', [UserOrdersController::class, 'getUserOrders']);
	Route::get('/profile/orders/getitems/{orderId}', [UserOrdersController::class, 'getOrderDetails']);
	Route::get('/profile/password', [UserPasswordController::class, 'index']);
	Route::post('/profile/password', [UserPasswordController::class, 'update']);

	Route::get('/shop-settings', [ShopSettingsController::class, 'index']);
	Route::post('/api/shop-settings', [ShopSettingsController::class, 'update']);

	Route::put('/reviews/{review}', [ReviewController::class, 'update']);
	Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

	// Driver-specific routes
	Route::middleware(['role:driver'])->group(function () {
		Route::get('/driver/coordinates', [DriverController::class, 'index']);
		Route::get('/driver/orders', [DriverOrderController::class, 'index'])->name('driver.orders');
		Route::get('/api/drivers', [DriverController::class, 'getDrivers']);
		Route::post('/driver/coordinates', [CoordinateController::class, 'store']);
		Route::get('/driver/coordinates/current', [CoordinateController::class, 'show']);
		Route::put('/driver/coordinates', [CoordinateController::class, 'update']);
	});
});

Route::middleware(['auth'])->group(function () {
    // Admin routes
    Route::get('/admin/dashboard', function () {
        return inertia('admin/Dashboard');
    })->name('admin.dashboard');

    Route::resource('/products', ProductController::class);
    Route::resource('/brands', BrandController::class);
    Route::get('/admin/categories', function () {
        return inertia('admin/CategoryManagement');
    })->name('admin.categories');

    // User management routes
    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users');
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);

    Route::resource('/navigation', NavigationController::class)->only(['index', 'store', 'update']);
    Route::resource('/orders', AdminOrders::class)->only(['index']);
    Route::get('/orders/getitems/{order_id}', [AdminOrders::class, 'getOrderDetails']);
    Route::get('/orders/generatepdf/{orderId}', [AdminOrders::class, 'generatePdf']);
    Route::put('/orders/{order}/status', [AdminOrders::class, 'updateStatus']);
    Route::get('/brands/getallbrands', [BrandController::class, 'getAllBrands']);
    Route::get('/shop-settings', [ShopSettingsController::class, 'index']);
    Route::post('/api/shop-settings', [ShopSettingsController::class, 'update']);
});

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
