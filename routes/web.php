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


use App\Http\Controllers\Store\ProductSearchController;
use App\Http\Controllers\Store\StoreProductController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\UserAdressInfoController;
use App\Http\Controllers\Store\UserOrdersController;
use App\Http\Controllers\Store\UserPasswordController;


Route::middleware(['auth'])->group(function () {
	// Images routes
	Route::resource('/images', ImageController::class)->only(['index', 'store', 'destroy']);
	Route::get('/getallimages', [ImageController::class, 'getAllImages']);
	Route::get('/getImagesPaginated', [ImageController::class, 'getImagesPaginated']);

	// Products routes
	Route::resource('/products', ProductController::class)->only(['index', 'create', 'store', 'destroy', 'update', 'show']);
	Route::get('/product/{product_id}', [StoreProductController::class, 'index']); // Moved this here for logical grouping

	Route::get('/products/{product}/reviews', [ReviewController::class, 'index']);
	Route::post('/products/{product}/reviews', [ReviewController::class, 'store']);

	// Subproducts routes
	Route::resource('/subproducts', SubproductController::class)->only(['store', 'update', 'destroy']);
	Route::get('/subproducts/byproduct/{product_id}', [SubproductController::class, 'getSubproductsByProductId']);

	// Categories routes
	Route::resource('/categories', CategoryController::class)->only(['index', 'store']);

	// Navigation routes
	Route::resource('/navigation', NavigationController::class)->only(['index', 'store', 'update']);

	Route::get('/navigation/getnavdata', [NavigationController::class, 'getNavigationData']); // Moved this here for logical grouping

	// Orders routes
	Route::resource('/orders', AdminOrders::class)->only(['index']);
	Route::get('/orders/getitems/{order_id}', [AdminOrders::class, 'getOrderDetails']);

	Route::resource('/brands', BrandController::class)->only(['index', 'store', 'update', 'destroy']);
	Route::get('/brands/getallbrands', [BrandController::class, 'getAllBrands']);

	// User profile routes
	Route::get('/profile/adressinfo', [UserAdressInfoController::class, 'index']);
	Route::post('/profile/updateadress', [UserAdressInfoController::class, 'store']);
	Route::get('/profile/orders', [UserOrdersController::class, 'index']);
	Route::get('/profile/orders/getitems/{order_id}', [UserOrdersController::class, 'getOrderDetails']);
	Route::get('/profile/password', [UserPasswordController::class, 'index']);

	Route::post('/profile/password', [UserPasswordController::class, 'update']);



	Route::get('/shop-settings', [ShopSettingsController::class, 'index']);
	Route::post('/api/shop-settings', [ShopSettingsController::class, 'update']);

	Route::put('/reviews/{review}', [ReviewController::class, 'update']);
	Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

	// Driver-specific routes
	Route::middleware(['role:driver'])->group(function () {
		Route::get('/driver/coordinates', function () {
			return inertia('Driver/DriverCoordinatesPage');
		});
		Route::post('/driver/coordinates', [CoordinateController::class, 'store']);
		Route::get('/driver/orders', [DriverOrderController::class, 'index'])->name('driver.orders');
		Route::get('/driver/coordinates/current', [CoordinateController::class, 'show']);
	});
});

Route::get('/productsearch', [ProductSearchController::class, 'index']); // Product search route
Route::post('/orders/generatepdf/{orderId}', [AdminOrders::class, 'generatePdf']);

// Cart routes
Route::post('/cart/add', [CartController::class, 'add']);
Route::post('/cart/remove', [CartController::class, 'remove']);
Route::get('/cart', [CartController::class, 'index']);
Route::get('/getcartitems', [CartController::class, 'getcartitems']); // Moved this here for logical grouping

// Checkout routes
Route::post('/checkout/{cartId}', [CheckoutController::class, 'checkout']);

// Add this route
Route::get('/store/products/search', [ProductSearchController::class, 'search']);

require __DIR__ . '/features.php';
require __DIR__ . '/auth.php';
