<?php

namespace App\Services;

use App\Interfaces\CategoryServiceInterface;
use App\Models\Category;
use Illuminate\Support\Collection;

/**
 * READ-ONLY: This service has verified tests and should not be modified without approval.
 * @see API_DOCUMENTATION.md#categories-read-only for details
 */
class CategoryService implements CategoryServiceInterface {
	public function getAll(): array {
		return Category::with(['parent', 'children'])
			->withCount(['products', 'children'])
			->get()
			->toArray();
	}

	public function getAllWithProductCount(): array {
		return Category::withCount(['products', 'children'])
			->with(['parent', 'children'])
			->get()
			->toArray();
	}

	public function getHierarchicalCategories(): Collection {
		return Category::whereNull('parent_id')
			->with(['children' => function ($query) {
				$query->withCount(['products', 'children']);
			}])
			->withCount(['products', 'children'])
			->get();
	}

	public function store(array $data) {
		$data['slug'] = \Illuminate\Support\Str::slug($data['name']);
		return Category::create($data);
	}

	public function update(int $id, array $data): Category {
		$category = Category::findOrFail($id);
		$category->update($data);
		return $category->fresh();
	}

	public function delete($id): bool {
		$category = Category::findOrFail($id);

		// Get all child category IDs
		$childIds = $category->getAllChildrenIds();

		// Delete all child categories
		Category::whereIn('id', $childIds)->delete();

		return true;
	}

	public function search(string $query): Collection {
		return Category::where('name', 'like', "%{$query}%")
			->orWhere('description', 'like', "%{$query}%")
			->withCount(['products', 'children'])
			->get();
	}

	public function bulkDelete(array $ids): bool {
		$categories = Category::whereIn('id', $ids)->get();
		$allIds = [];

		foreach ($categories as $category) {
			$allIds = array_merge($allIds, $category->getAllChildrenIds());
		}

		return Category::whereIn('id', array_unique($allIds))->delete();
	}

	public function findById(int $id): Category {
		return Category::findOrFail($id);
	}

	public function getAllWithStats(): Collection {
		return Category::withCount(['products', 'children'])
			->with(['products' => function ($query) {
				$query->withCount('reviews')
					->withAvg('reviews', 'rating')
					->withSum('subproducts', 'stock');
			}])
			->get()
			->map(function ($category) {
				return [
					'id' => $category->id,
					'name' => $category->name,
					'products_count' => $category->products_count,
					'children_count' => $category->children_count,
					'total_reviews' => $category->products->sum('reviews_count'),
					'average_rating' => $category->products->avg('reviews_avg_rating'),
					'total_stock' => $category->products->sum('subproducts_sum_stock')
				];
			});
	}
}
