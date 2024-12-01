<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\SubproductService;
use App\Http\Requests\SubproductRequest;

class SubproductController extends Controller
{
	private $subproductService;

	public function __construct(SubproductService $subproductService)
	{
		$this->subproductService = $subproductService;
	}

	public function store(SubproductRequest $request)
	{
		$this->subproductService->create($request);
		return response()->json(201)->header('X-Message', 'Subproduct created successfully');
	}

	public function update(SubproductRequest $request, $id)
	{
		$result = $this->subproductService->update($request, $id);
		return response()->json($result, 200)->header('X-Message', 'Subproduct updated successfully');
	}

	public function getSubproductsByProductId(Request $request)
	{
		$subproducts = $this->subproductService->getSubproductsByProductId($request->product_id);
		return response()->json($subproducts, 200);
	}

	public function destroy($id)
	{
		$this->subproductService->deleteSubproduct($id);
		return response()->json(['message' => 'Subproduct deleted successfully'], 200);
	}
}
