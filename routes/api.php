<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check endpoint for testing
Route::get('/ping', function () {
    return response()->json(['status' => 'ok']);
});

// All routes have been moved to web.php
