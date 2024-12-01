<?php

namespace App\Services;

use App\Interfaces\CategoryServiceInterface;
use App\Models\Category;


class CategoryService implements CategoryServiceInterface
{
	public function getAll(): array
	{
		return Category::all()->toArray();
	}

	public function store(array $data)
	{
		return Category::create($data);
	}


}
