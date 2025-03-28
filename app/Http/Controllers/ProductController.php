<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Requests\CreateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    private ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->middleware('auth');
        $this->middleware('admin');
        $this->productService = $productService;
    }

    public function index(Request $request)
    {
        $sortKey = $request->input('sortkey', 'name');
        $sortDirection = $request->input('sortdirection', 'asc');
        $search = $request->input('search', '');

        return inertia('admin/ProductList', [
            'products' => $this->productService->getPaginatedProducts($sortKey, $sortDirection, $search),
            'sortkey' => $sortKey,
            'sortdirection' => $sortDirection,
            'search' => $search
        ]);
    }

    public function create()
    {
        return inertia('admin/NewProduct');
    }

    public function store(CreateProductRequest $request)
    {
        $product = $this->productService->createProduct($request->validated());
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['images', 'categories', 'brand', 'subproducts']));
    }

    public function update(ProductRequest $request, $id)
    {
        $validated = $request->validated();
        $updated = $this->productService->update($validated, $id);
        return response()->json($updated);
    }

    public function destroy($id)
    {
        if (!Auth::user() || !Auth::user()->role === 'admin') {
            return response()->json(['message' => 'Unauthorized action'], 403);
        }

        try {
            // Validate ID is a number
            if (!is_numeric($id)) {
                return response()->json(['message' => 'Invalid product ID format'], 404);
            }

            $this->productService->delete((int)$id);
            return response()->json(null, 204)
                ->header('X-Message', 'Product deleted successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (\App\Exceptions\ProductHasOrdersException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete product'], 500);
        }
    }
}