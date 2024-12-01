<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use App\Http\Requests\CategoryRequest;



class CategoryController extends Controller
{
	private CategoryService $categoryService;

	public function __construct(CategoryService $categoryService)
	{
		$this->categoryService = $categoryService;
	}

	public function store(CategoryRequest $request)
	{

		$result = $this->categoryService->store($request->all());
		return response()->json(['success' => true, 'category' => $result], 201);
	}


	public function index()
	{
		return response()->json(['success' => true, 'categories' => $this->categoryService->getAll()], 200);
	}
	
}
