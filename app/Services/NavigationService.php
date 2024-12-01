<?php

namespace App\Services;

use App\Models\Header;
use App\Interfaces\NavigationServiceInterface;
use Illuminate\Support\Facades\Cache;

class NavigationService implements NavigationServiceInterface {
	protected $cacheKey = 'navigation_data';

	public function getNavigationData(): array {
		return Cache::remember($this->cacheKey, 3600, function () {
			return Header::with('navigationItems.categories')->get()->toArray();
		});
	}

	public function updateHeader(array $headerData): Header {
		$header = Header::find($headerData['id']);
		if (!$header || $headerData['id'] == 0) {
			$header = Header::create([
				'name' => $headerData['name'],
				'order_num' => $headerData['order_num']
			]);
		} else {
			$header->update([
				'name' => $headerData['name'],
				'order_num' => $headerData['order_num']
			]);
		}

		Cache::forget($this->cacheKey);
		return $header;
	}

	public function syncNavigation($headersData) {
		$keepHeadersIds = [];

		foreach ($headersData as $data) {
			$header = $this->updateHeader($data);
			$keepHeadersIds[] = $header->id;

			$keepNavigationItemIds = [];

			foreach ($data['navigation_items'] as $item) {
				$navigationItem = $header->navigationItems()->updateOrCreate(
					['id' => $item['id'] ?? null],
					[
						'name' => $item['name'],
						'order_num' => $item['order_num'],
					]
				);

				$keepNavigationItemIds[] = $navigationItem->id;

				if (isset($item['categories']) && !empty($item['categories'])) {
					$categoryIds = collect($item['categories'])->pluck('id');
					$navigationItem->categories()->sync($categoryIds);
				}
			}

			$header->navigationItems()->whereNotIn('id', $keepNavigationItemIds)->delete();
		}

		Header::whereNotIn('id', $keepHeadersIds)->get()->each(function ($header) {
			$header->navigationItems()->each(function ($navigationItem) {
				$navigationItem->categories()->detach();
			});
			$header->navigationItems()->delete();
			$header->delete();
		});

		Cache::forget($this->cacheKey);
	}
}
