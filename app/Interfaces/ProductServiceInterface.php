<?php

namespace App\Interfaces;

use App\Models\Product;

interface ProductServiceInterface {
	public function create(array $data): Product;
	public function update($data, $id);
	public function getPaginatedProducts($sortkey, $sortDirection, $limit): array;
	public function delete(int $id): bool;
	public function getPaginatedStoreProducts(array $filters): array;
}
