<?php

namespace App\Services;

use App\Models\Brand;

class BrandService
{
	public function getPaginatedBrands($sortKey, $sortDirection, $limit)
	{
		return Brand::orderBy($sortKey, $sortDirection)->paginate($limit);
	}

	public function getBrandById($id)
	{
		return Brand::findOrFail($id);
	}

	public function getAllBrands()
	{
		return Brand::all();
	}

	public function createBrand($data)
	{
		return Brand::create($data);
	}

	public function updateBrand($id, $data)
	{
		$brand = Brand::findOrFail($id);
		$brand->update($data);
		return $brand;
	}

	public function deleteBrand($id)
	{
		$brand = Brand::findOrFail($id);
		return $brand->delete();
	}
}
