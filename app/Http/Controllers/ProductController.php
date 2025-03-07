<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\ProductRequest;
use App\Interfaces\ProductServiceInterface;

class ProductController extends Controller
{
	private $productService;

	public function __construct(ProductServiceInterface $productService)
	{
		$this->productService = $productService;
	}

	public function index(Request $request)
	{
		$sortKey = $request->input('sortkey', 'name');
		$sortDirection = $request->input('sortdirection', 'asc');
		$limit = $request->input('limit', 10);

		return inertia('admin/ProductList', [
			'products' => $this->productService->getPaginatedProducts($sortKey, $sortDirection, $limit),
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
		$this->productService->create($request->all());
		return response()->json(['success' => true], 201)->header('X-Message', 'Product created successfully');
	}

	public function update(ProductRequest $request, $id)
	{
		$result = $this->productService->update($request->all(), $id);
		return response()->json($result, 200)->header('X-Message', 'Product updated successfully');
	}

	public function destroy($id)
	{
		if ($this->productService->delete($id)) {
			return response()->json(null, 204)->header('X-Message', 'Product deleted successfully');
		}
	}
}