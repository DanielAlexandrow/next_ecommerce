<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\ProductRequest;
use App\Interfaces\ProductServiceInterface;
use App\Exceptions\ProductHasOrdersException;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    protected $productService;

    public function __construct(ProductServiceInterface $productService)
    {
        $this->productService = $productService;
        $this->middleware('role:admin')->only('destroy');
    }

    public function index(Request $request)
    {
        $sortKey = $request->input('sortkey', 'name');
        $sortDirection = $request->input('sortdirection', 'asc');
        $limit = $request->input('limit', 10);

        $products = $this->productService->getPaginatedProducts($sortKey, $sortDirection, $limit);

        return inertia('admin/ProductList', [
            'products' => $products,
            'sortkey' => $sortKey,
            'sortdirection' => $sortDirection,
        ]);
    }

    public function create()
    {
        return inertia('admin/NewProduct');
    }

    public function store(ProductRequest $request)
    {
        $product = $this->productService->create($request->validated());
        return response()->json([
            'success' => true,
            'product' => $product
        ], 201)->header('X-Message', 'Product created successfully');
    }

    public function update(ProductRequest $request, $id)
    {
        $result = $this->productService->update($request->validated(), $id);
        return response()->json([
            'success' => true,
            'product' => $result
        ], 200)->header('X-Message', 'Product updated successfully');
    }

    public function destroy($id)
    {
        if (!is_numeric($id)) {
            return response()->json(['message' => 'Invalid product ID format'], 404);
        }

        // Explicit auth check for admin role
        if (!Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized action'], 403);
        }

        try {
            if ($this->productService->delete($id)) {
                return response()->json(null, 204)->header('X-Message', 'Product deleted successfully');
            }
            return response()->json(['message' => 'Failed to delete product'], 500);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Product not found'], 404);
        } catch (ProductHasOrdersException $e) {
            return response()->json(['message' => $e->getMessage()], 409);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete product'], 500);
        }
    }
}