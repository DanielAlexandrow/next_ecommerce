<?php

namespace App\Interfaces;

use App\Models\Category;

interface CategoryServiceInterface {
	public function getAll(): array;

	public function getAllWithProductCount(): array;

	public function store(array $data);

	public function delete($id): bool;
}
