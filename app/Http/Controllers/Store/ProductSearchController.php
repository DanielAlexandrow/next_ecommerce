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
		$filters = [
			'name' => $request->input('name', ''),
			'minPrice' => $request->input('minPrice', 0),
			'maxPrice' => $request->input('maxPrice', 1000),
			'sortKey' => $this->getSortKey($request->input('sortBy', 'newest')),
			'sortDirection' => $this->getSortDirection($request->input('sortBy', 'newest')),
			'limit' => 12
		];

		$products = $this->productService->getPaginatedStoreProducts($filters);

		return response()->json([
			'products' => $products['data'],
			'pagination' => [
				'total' => $products['total'],
				'per_page' => $products['per_page'],
				'current_page' => $products['current_page'],
				'last_page' => $products['last_page']
			]
		]);
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
