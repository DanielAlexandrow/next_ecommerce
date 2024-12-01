<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CoordinateController;
use App\Http\Controllers\Store\ProductSearchController;

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

// Ensure the user is authenticated and has the 'driver' role
Route::middleware(['auth:sanctum', 'role:driver'])->group(function () {
    Route::post('/coordinates', [CoordinateController::class, 'store']);
    Route::put('/coordinates', [CoordinateController::class, 'update']);
    Route::get('/coordinates', [CoordinateController::class, 'show']);
});

// Product search API endpoint
Route::get('/products/search', [ProductSearchController::class, 'search']);
