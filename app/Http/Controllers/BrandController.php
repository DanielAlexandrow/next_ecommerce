<?php

namespace App\Http\Controllers;

use App\Services\BrandService;
use Illuminate\Http\Request;
use App\Http\Requests\BrandRequest;

class BrandController extends Controller
{
	protected BrandService $brandService;

	public function __construct(BrandService $brandService)
	{
		$this->brandService = $brandService;
	}

	public function index(Request $request)
	{
		$sortKey = $request->input('sortkey', 'name');
		$sortDirection = $request->input('sortdirection', 'asc');
		$limit = $request->input('limit', 10);

		return inertia(
			'admin/BrandsPage',
			[
				'brands' => $this->brandService->getPaginatedBrands($sortKey, $sortDirection, $limit),
				'sortkey' => $sortKey,
				'sortdirection' => $sortDirection,
			]
		);
	}

	public function getAllBrands(): \Illuminate\Http\JsonResponse
    {
		return response()->json($this->brandService->getAllBrands());
	}

	public function show($id): \Illuminate\Http\JsonResponse
    {
		$brand = $this->brandService->getBrandById($id);
		return response()->json($brand);
	}

	public function store(BrandRequest $request): \Illuminate\Http\JsonResponse
    {
		$brand = $this->brandService->createBrand($request->all());
		return response()->json($brand, 201)->header('X-Message', 'Brand created successfully');
	}

	public function update(BrandRequest $request, $id): \Illuminate\Http\JsonResponse
    {
		$brand = $this->brandService->updateBrand($id, $request->all());
		return response()->json($brand);
	}

	public function destroy($id): \Illuminate\Http\JsonResponse
    {
		$this->brandService->deleteBrand($id);
		return response()->json(null, 204)->header('X-Message', 'Brand deleted successfully');
	}
}
