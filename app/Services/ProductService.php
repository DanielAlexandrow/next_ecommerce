<?php

namespace App\Services;

use App\Interfaces\ProductServiceInterface;

use Illuminate\Http\Request;
use App\Models\Product;

/**
 * Class ProductService
 *
 * @package App\Services
 * @implements ProductServiceInterface
 */
class ProductService implements ProductServiceInterface {

	public function create($data) {
		$product = Product::create($data);
		$product->images()->attach($data['images'] ?? []);
		$product->categories()->attach($data['categories'] ?? []);
		return $product;
	}

	public function update($data, $id) {
		$product = Product::findOrFail($id);
		$product->update($data);
		$product->images()->sync($data['images'] ?? []);
		$product->categories()->sync($data['categories'] ?? []);

		return $product->load('images', 'categories', 'brand');
	}

	public function delete($id) {
		$product = Product::findOrFail($id);
		$product->images()->detach();
		$product->categories()->detach();
		return $product->delete();
	}

	public function getPaginatedProducts($sortKey, $sortDirection, $limit): array {
		return Product::with('images')
			->with('categories')
			->with('brand')
			->orderBy($sortKey, $sortDirection)
			->paginate($limit)->toArray();
	}


	/**
	 * Get paginated products for the store.
	 *
	 * @param array $filters An array of filters including:
	 *- minPrice: float
	 *- maxPrice: float
	 *- name: stringrodu
	 *- sortKey: string
	 *- sortDirection: string
	 *- limit: int
	 * @return array Paginated products data for the store
	 */
	public function getPaginatedStoreProducts(array $filters): array {
		return Product::with(['images', "reviews", 'subproducts' => function ($query) use ($filters) {
			$query->whereBetween('price', [$filters['minPrice'], $filters['maxPrice']]);
		}])
			->where('name', 'like', '%' . $filters['name'] . '%')
			->whereHas('subproducts', function ($query) use ($filters) {
				$query->whereBetween('price', [$filters['minPrice'], $filters['maxPrice']]);
			})
			->orderBy($filters['sortKey'], $filters['sortDirection'])
			->paginate($filters['limit'])
			->toArray();
	}
}
