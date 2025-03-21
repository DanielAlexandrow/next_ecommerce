<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewRequest;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct()
    {
        // No authentication needed for viewing reviews
        $this->middleware('auth')->except(['index']);
        // Verify purchase only after validation passes
        $this->middleware('verify.purchase')->only(['store']);
    }

    public function index(Product $product)
    {
        $reviews = $product->reviews()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => $product->average_rating,
            'total_reviews' => $product->reviews()->count()
        ]);
    }

    public function store(ReviewRequest $request, Product $product)
    {
        $review = $product->reviews()->create([
            'user_id' => auth()->id(),
            ...$request->validated()
        ]);

        return response()->json($review->load('user'), 201);
    }

    public function update(ReviewRequest $request, Review $review)
    {
        $this->authorize('update', $review);
        
        $review->update($request->validated());
        return response()->json($review->fresh()->load('user'));
    }

    public function destroy(Review $review)
    {
        $this->authorize('delete', $review);
        
        $review->delete();
        return response()->noContent();
    }
}
