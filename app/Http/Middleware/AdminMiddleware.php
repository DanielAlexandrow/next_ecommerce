<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized. Admin access required.'], 403);
            }
            
            if (Auth::check()) {
                Auth::logout();
                return redirect()->route('adminlogin')->with('error', 'This account does not have administrator privileges.');
            }
            
            return redirect()->route('adminlogin');
        }
        return $next($request);
    }
}