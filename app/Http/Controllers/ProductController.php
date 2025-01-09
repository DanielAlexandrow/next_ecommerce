<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\ProductService;
use App\Exceptions\ProductHasOrdersException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductController extends Controller {
	private ProductService $productService;

	public function __construct(ProductService $productService) {
		$this->productService = $productService;
		$this->middleware('auth');
		$this->middleware('role:admin')->only(['destroy']);
	}

	public function destroy($id): JsonResponse {
		if (!is_numeric($id)) {
			return response()->json(['message' => 'Invalid product ID format'], 404);
		}

		try {
			if (!auth()->user()->hasRole('admin')) {
				return response()->json(['message' => 'Unauthorized action'], 403);
			}

			$this->productService->delete((int)$id);
			return response()->json(['message' => 'Product deleted successfully']);
		} catch (ModelNotFoundException $e) {
			return response()->json(['message' => 'Product not found'], 404);
		} catch (ProductHasOrdersException $e) {
			return response()->json(['message' => $e->getMessage()], 409);
		} catch (\Exception $e) {
			\Log::error('Failed to delete product: ' . $e->getMessage());
			return response()->json(['message' => 'Failed to delete product'], 500);
		}
	}

	public function store(Request $request): JsonResponse {
		try {
			// Validate request
			$validated = $request->validate([
				'name' => 'required|string|max:255',
				'description' => 'required|string|max:65535',
				'brand_id' => 'required|exists:brands,id',
				'categories' => 'array',
				'categories.*' => 'exists:categories,id',
				'subproducts' => 'required|array|min:1',
				'subproducts.*.name' => 'required|string|max:255',
				'subproducts.*.sku' => 'required|string|max:50|distinct',
				'subproducts.*.price' => 'required|numeric|min:0.01',
				'subproducts.*.stock' => 'required|integer|min:0',
				'subproducts.*.weight' => 'nullable|numeric|min:0',
				'subproducts.*.dimensions' => 'nullable|array',
				'subproducts.*.dimensions.length' => 'required_with:subproducts.*.dimensions|numeric|min:0',
				'subproducts.*.dimensions.width' => 'required_with:subproducts.*.dimensions|numeric|min:0',
				'subproducts.*.dimensions.height' => 'required_with:subproducts.*.dimensions|numeric|min:0',
				'subproducts.*.metadata' => 'nullable|array',
				'metadata' => 'nullable|array',
				'metadata.featured' => 'nullable|boolean',
				'metadata.tags' => 'nullable|array',
				'metadata.tags.*' => 'string',
				'metadata.seo' => 'nullable|array',
				'metadata.seo.title' => 'nullable|string|max:60',
				'metadata.seo.description' => 'nullable|string|max:160'
			]);

			// Create product
			$product = $this->productService->create($validated);

			return response()->json([
				'message' => 'Product created successfully',
				'product' => $product
			], 201);
		} catch (\Illuminate\Validation\ValidationException $e) {
			return response()->json([
				'message' => 'Validation failed',
				'errors' => $e->errors()
			], 422);
		} catch (\Exception $e) {
			\Log::error('Failed to create product: ' . $e->getMessage());
			return response()->json([
				'message' => 'Failed to create product',
				'error' => $e->getMessage()
			], 500);
		}
	}
}
