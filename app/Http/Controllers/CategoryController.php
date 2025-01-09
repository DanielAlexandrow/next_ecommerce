<?php

namespace App\Http\Controllers;

use App\Services\CategoryService;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\Request;

class CategoryController extends Controller {
	private CategoryService $categoryService;

	public function __construct(CategoryService $categoryService) {
		$this->categoryService = $categoryService;
	}

	public function index() {
		$categories = $this->categoryService->getAllWithProductCount();
		return response()->json(['success' => true, 'categories' => $categories], 200);
	}

	public function store(CategoryRequest $request) {
		$result = $this->categoryService->store($request->all());
		return response()->json(['success' => true, 'category' => $result], 201);
	}

	public function update(CategoryRequest $request, $id) {
		$result = $this->categoryService->update($id, $request->all());
		return response()->json(['success' => true, 'category' => $result], 200);
	}

	public function destroy($id) {
		$this->categoryService->delete($id);
		return response()->json(['success' => true], 200);
	}

	public function search(Request $request) {
		$query = $request->get('query', '');
		$categories = $this->categoryService->search($query);
		return response()->json(['success' => true, 'categories' => $categories], 200);
	}

	public function bulkDelete(Request $request) {
		$ids = $request->get('ids', []);
		$this->categoryService->bulkDelete($ids);
		return response()->json(['success' => true], 200);
	}

	public function getHierarchy() {
		$categories = $this->categoryService->getHierarchicalCategories();
		return response()->json(['success' => true, 'categories' => $categories], 200);
	}
}
