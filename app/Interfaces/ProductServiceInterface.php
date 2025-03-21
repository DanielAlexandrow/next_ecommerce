<?php

namespace App\Interfaces;

use App\Models\Product;

interface ProductServiceInterface {
    public function create(array $data): Product;
    public function update(array $data, int $id);
    public function getPaginatedProducts(string $sortKey, string $sortDirection, int $limit);
    public function delete(int $id): bool;
    public function createProduct(array $data);
    public function getPaginatedStoreProducts(array $filters): array;
}
