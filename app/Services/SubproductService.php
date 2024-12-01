<?php

namespace App\Services;

use App\Interfaces\SubproductServiceInterface;
use Illuminate\Http\Request;
use App\Models\Subproduct;

class SubproductService implements SubproductServiceInterface
{
	public function create(Request $request)
	{
		return Subproduct::create($request->all());
	}

	public function update(Request $request, $id)
	{
		$subproduct =  Subproduct::find($id);
		if (!$subproduct) {
			throw new \Exception('Subproduct not found');
		}

		if ($subproduct->update($request->all())) {
			return $subproduct;
		}

		return false;
	}



	public function deleteSubproduct($id)
	{
		$subproduct = Subproduct::find($id);
		if (!$subproduct) {
			throw new \Exception('Subproduct not found');
		}

		return $subproduct->delete();
	}

	function getSubproductsByProductId($id)
	{
		return Subproduct::where('product_id', $id)->get();
	}
}
