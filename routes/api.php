<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Store\ProductSearchController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ProductController;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Subproduct;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::get('/products/search', [ProductSearchController::class, 'search']);

// Authentication routes
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Cart API endpoints
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/remove', [CartController::class, 'remove']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::get('/cart/items', [CartController::class, 'getcartitems']);

    // Products API endpoints
    Route::get('/products', [ProductSearchController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Chat routes
    Route::post('/chat/messages', [ChatController::class, 'sendMessage']);
    Route::get('/chat/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/typing', [ChatController::class, 'agentTyping']);
    Route::post('/chat/status', [ChatController::class, 'agentStatusChange']);
});

// Test routes
Route::get('/test/seed-products', function () {
    if (app()->environment('production')) {
        abort(404);
    }

    // Create a test brand
    $brand = Brand::firstOrCreate(['name' => 'Test Brand']);

    // Create test products
    for ($i = 1; $i <= 5; $i++) {
        $product = Product::create([
            'name' => "Test Product $i",
            'description' => "Description for test product $i",
            'available' => true,
            'brand_id' => $brand->id,
        ]);

        // Create subproducts for each product
        for ($j = 1; $j <= 3; $j++) {
            Subproduct::create([
                'name' => "Size $j",
                'price' => 10.00 * $j,
                'available' => true,
                'product_id' => $product->id,
            ]);
        }
    }

    return response()->json(['message' => 'Test products seeded']);
});
