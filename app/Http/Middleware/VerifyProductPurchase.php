<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Order;

class VerifyProductPurchase
{
    public function handle(Request $request, Closure $next)
    {
        $product = $request->route('product');
        $user = $request->user();

        $hasPurchased = Order::where('user_id', $user->id)
            ->whereHas('orderItems.subproduct', function ($query) use ($product) {
                $query->where('product_id', $product->id);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'message' => 'You must purchase this product before reviewing it'
            ], 403);
        }

        return $next($request);
    }
}
