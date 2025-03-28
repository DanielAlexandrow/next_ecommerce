<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Subproduct;
use Symfony\Component\HttpFoundation\Response;

class ValidateParams
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Validate cart operations
        if ($request->is('cart/add') || $request->is('cart/remove')) {
            $errors = [];
            
            // Validate subproduct_id
            if (!$request->has('subproduct_id')) {
                $errors['subproduct_id'] = ['Subproduct ID is required'];
            } elseif (!is_numeric($request->subproduct_id)) {
                $errors['subproduct_id'] = ['Subproduct ID must be numeric'];
            } else {
                // Check if subproduct exists and is available
                $subproduct = Subproduct::find($request->subproduct_id);
                if (!$subproduct) {
                    $errors['subproduct_id'] = ['Product variant not found'];
                } elseif (!$subproduct->available) {
                    $errors['subproduct_id'] = ['Product variant is not available'];
                }
            }
                
            // For add operations, always validate quantity
            if ($request->is('cart/add')) {
                if (!$request->has('quantity')) {
                    $errors['quantity'] = ['Quantity is required'];
                } elseif (!is_numeric($request->quantity) || $request->quantity < 1) {
                    $errors['quantity'] = ['Quantity must be at least 1'];
                } elseif (isset($subproduct) && $request->quantity > $subproduct->stock) {
                    $errors['subproduct_id'] = ['Not enough items in stock'];
                }
            }
            
            if (count($errors) > 0) {
                return response()->json(['errors' => $errors], 422);
            }
        }
        
        return $next($request);
    }
}