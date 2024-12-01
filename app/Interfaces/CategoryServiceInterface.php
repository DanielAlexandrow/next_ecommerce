<?php

namespace App\Interfaces;

use App\Models\Category;

interface CategoryServiceInterface
{
	public function getAll(): array;

	public function store(array $data);
}
