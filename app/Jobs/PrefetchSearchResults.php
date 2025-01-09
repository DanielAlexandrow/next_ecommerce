<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Services\ProductService;
use Illuminate\Support\Facades\Cache;

class PrefetchSearchResults implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private array $filters;
    private const CACHE_TTL = 3600; // 1 hour

    public function __construct(array $filters) {
        $this->filters = $filters;
        $this->onQueue('low'); // Use low priority queue
    }

    public function handle(ProductService $productService): void {
        $cacheKey = 'products_' . md5(json_encode($this->filters));

        // Skip if already cached
        if (Cache::has($cacheKey)) {
            return;
        }

        // Get results and cache them
        $results = $productService->getPaginatedStoreProducts($this->filters);
        Cache::put($cacheKey, $results, self::CACHE_TTL);

        // Track cache key for cleanup
        $cacheKeys = Cache::get('search_cache_keys', []);
        $cacheKeys[$cacheKey] = now();
        Cache::put('search_cache_keys', $cacheKeys, self::CACHE_TTL);
    }

    public function tags(): array {
        return ['search', 'prefetch'];
    }

    public function retryUntil(): \DateTime {
        return now()->addMinutes(5);
    }
}
