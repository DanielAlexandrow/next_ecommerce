<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ProductService;
use Inertia\Inertia;

class ProductSearchController extends Controller {
	private $productService;

	public function __construct(ProductService $productService) {
		$this->productService = $productService;
	}

	public function index() {
		// Return the Inertia view for the product search page
		return Inertia::render('store/ProductSearch');
	}

	public function search(Request $request) {
		try {
			// Validate request parameters
			$validated = $request->validate([
				'name' => 'nullable|string|max:255',
				'minPrice' => 'nullable|numeric|min:0',
				'maxPrice' => 'nullable|numeric|min:0',
				'sortBy' => 'nullable|string|in:newest,price_asc,price_desc,name_asc,name_desc,rating_desc',
				'page' => 'nullable|integer|min:1'
			]);

			// Check if maxPrice is less than minPrice
			if ($request->has('minPrice') && $request->has('maxPrice') && 
				$request->input('maxPrice') < $request->input('minPrice')) {
				return response()->json([
					'message' => 'Maximum price cannot be less than minimum price',
					'errors' => ['maxPrice' => ['Maximum price must be greater than minimum price']]
				], 422);
			}

			$filters = [
				'name' => $request->input('name', ''),
				'minPrice' => $request->input('minPrice', 0),
				'maxPrice' => $request->input('maxPrice', 1000),
				'sortKey' => $this->getSortKey($request->input('sortBy', 'newest')),
				'sortDirection' => $this->getSortDirection($request->input('sortBy', 'newest')),
				'limit' => 12
			];

			$products = $this->productService->getPaginatedStoreProducts($filters);

			if (!isset($products['data'])) {
				throw new \Exception('Invalid product data structure');
			}

			return response()->json([
				'products' => $products['data'],
				'pagination' => [
					'total' => $products['total'],
					'per_page' => $products['per_page'],
					'current_page' => $products['current_page'],
					'last_page' => $products['last_page']
				]
			]);
		} catch (\Illuminate\Validation\ValidationException $e) {
			return response()->json([
				'message' => 'Invalid input parameters',
				'errors' => $e->errors()
			], 422);
		} catch (\Exception $e) {
			return response()->json([
				'message' => 'An error occurred while processing your request',
				'error' => $e->getMessage()
			], 500);
		}
	}

	public function getProductsByNavigationItem($navigationItemId)
	{
		try {
			// Return the Inertia view for the product search page with navigation item ID
			return Inertia::render('store/ProductSearch', [
				'navigationItemId' => $navigationItemId
			]);
		} catch (\Exception $e) {
			return response()->json([
				'message' => 'An error occurred while processing your request',
				'error' => $e->getMessage()
			], 500);
		}
	}

	private function getSortKey(string $sortBy): string {
		return match ($sortBy) {
			'price_asc', 'price_desc' => 'price',
			'name_asc', 'name_desc' => 'name',
			'rating_desc' => 'average_rating',
			'newest' => 'created_at',
			default => 'created_at'
		};
	}

	private function getSortDirection(string $sortBy): string {
		return match ($sortBy) {
			'price_desc', 'name_desc', 'rating_desc' => 'desc',
			'price_asc', 'name_asc' => 'asc',
			'newest' => 'desc',
			default => 'desc'
		};
	}
}
