<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Image;
use App\Models\ProductImage;

class ImageService {
	public function validateImage(array $data) {
		return Validator::make($data, [
			'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
		]);
	}

	public function storeImage(Request $request): ?array {
		$file = $request->file('image');
		$fileName = $file->getClientOriginalName();
		$path = Storage::disk('public')->putFileAs('images', $file, $fileName);

		$image = new Image([
			'name' => $fileName,
			'path' => $path,
		]);

		return $image->save() ? ['success' => true, 'data' => $image] : null;
	}

	public function deleteImage(int $id): bool {
		$image = Image::findOrFail($id);
		Storage::disk('public')->delete($image->path);
		ProductImage::where('image_id', $id)->delete();
		$image->products()->detach();
		return $image->delete();
	}

	public function getAllImages(): \Illuminate\Support\Collection {
		return Image::all();
	}


	public function getPaginatedImages(int $page, int $perPage, string $searchTerm = '') {
		$query = Image::query();

		if (!empty($searchTerm)) {
			$query->where('name', 'like', '%' . $searchTerm . '%');
		}

		return $query->orderBy('created_at', 'desc')
			->paginate($perPage, ['*'], 'page', $page);
	}
}
