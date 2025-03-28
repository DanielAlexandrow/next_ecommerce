<?php

namespace App\Interfaces;

use App\Models\Category;

/**
 * READ-ONLY: This interface has verified tests and should not be modified without approval.
 * @see API_DOCUMENTATION.md#categories-read-only for details
 */
interface CategoryServiceInterface {
	public function getAll(): array;

	public function getAllWithProductCount(): array;

	public function store(array $data);

	public function delete($id): bool;
}
