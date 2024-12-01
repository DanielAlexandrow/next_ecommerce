<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller {
    public function index(Request $request, Product $product) {
        $sortBy = $request->input('sortBy', 'created_at');
        $sortOrder = $request->input('sortOrder', 'desc');

        $allowedSortFields = ['created_at', 'rating'];
        $sortBy = in_array($sortBy, $allowedSortFields) ? $sortBy : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $reviews = $product->reviews()
            ->with('user')
            ->orderBy($sortBy, $sortOrder)
            ->paginate(10);

        $averageRating = $product->averageRating();

        return response()->json([
            'reviews' => $reviews,
            'averageRating' => $averageRating
        ]);
    }

    public function store(Request $request, Product $product) {
        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $user = Auth::user();

        if (!$user->isAdmin() && !$user->hasPurchased($product)) {
            return response()->json(['message' => 'You must purchase this product before reviewing it.'], 403);
        }

        $review = $product->reviews()->create([
            'user_id' => $user->id,
            'title' => $request->title,
            'content' => $request->content,
            'rating' => $request->rating,
        ]);

        return response()->json($review, 201);
    }

    public function update(Request $request, Review $review) {
        $this->authorize('update', $review);

        $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $review->update($request->all());

        return response()->json($review);
    }

    public function destroy(Review $review) {
        $this->authorize('delete', $review);

        $review->delete();

        return response()->json(null, 204);
    }
}
