<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use App\Services\ImageService;
use Illuminate\Support\Facades\Log;



class ImageController extends Controller {
	private ImageService $imageService;

	public function __construct(ImageService $imageService) {
		$this->imageService = $imageService;
	}

	public function index(Request $request) {
		$sortKey = $request->input('sortkey', 'name');
		$sortDirection = $request->input('sortdirection', 'asc');
		$limit = $request->input('limit', 10);
		$search = $request->input('search');

		$images = Image::when($search, function ($query) use ($search) {
			$query->where('name', 'LIKE', "%{$search}%");
		})
			->orderBy($sortKey, $sortDirection)
			->paginate($limit);


		return inertia('admin/UploadPage', [
			'images' => $images,
			'sortkey' => $sortKey,
			'sortdirection' => $sortDirection,
		]);
	}
	public function store(Request $request) {
		$validator = $this->imageService->validateImage($request->all());

		if ($validator->fails()) {
			return response()->json($validator->errors(), 422);
		}

		$response = $this->imageService->storeImage($request);

		if ($response === null) {
			return response()->json(null, 400)->header('X-Message', 'Image upload failed');
		}

		Log::info($response);

		return response()->json($response, 201)->header('X-Message', 'Image uploaded successfully');
	}

	public function destroy(int $id) {
		$result = $this->imageService->deleteImage($id);


		return response()->json(null, 204)->header('X-Message', 'Image deleted successfully');
	}

	public function getAllImages() {
		return response()->json(['success' => true, 'images' => $this->imageService->getAllImages()], 200);
	}

	public function getImagesPaginated(Request $request) {
		$page = $request->input('page', 1);
		$perPage = $request->input('per_page', 12);
		$searchTerm = $request->input('search', '');

		$images = Image::when($searchTerm, function ($query) use ($searchTerm) {
			return $query->where('name', 'like', '%' . $searchTerm . '%');
		})
			->orderBy('name', 'asc')
			->paginate($perPage)
			->toArray();

		return response()->json($images);
	}

	public function search(Request $request) {
		$searchTerm = $request->input('term');
		$images = Image::when($searchTerm, function ($query) use ($searchTerm) {
			$query->where('name', 'LIKE', "%{$searchTerm}%");
		})
		->orderBy('created_at', 'desc')
		->paginate(10);

		return response()->json([
			'data' => $images->items(),
			'meta' => [
				'current_page' => $images->currentPage(),
				'last_page' => $images->lastPage(),
				'from' => $images->firstItem(),
				'to' => $images->lastItem(),
				'total' => $images->total(),
				'per_page' => $images->perPage(),
				'links' => $images->linkCollection()->toArray()
			]
		]);
	}
}
