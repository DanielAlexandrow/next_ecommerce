<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class SearchTransitionService
{
    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get prefetched results for common transitions
     */
    public function getPrefetchedResults(array $currentFilters): array
    {
        $variations = $this->generateFilterVariations($currentFilters);
        $results = [];

        foreach ($variations as $variation) {
            $cacheKey = 'products_' . md5(json_encode($variation));
            if (Cache::has($cacheKey)) {
                $results[$this->getVariationKey($variation)] = Cache::get($cacheKey);
            }
        }

        return $results;
    }

    /**
     * Prefetch next likely results based on common user patterns
     */
    public function prefetchNextLikelyResults(array $currentFilters): void
    {
        $variations = $this->generateFilterVariations($currentFilters);
        
        foreach ($variations as $variation) {
            $cacheKey = 'products_' . md5(json_encode($variation));
            if (!Cache::has($cacheKey)) {
                // Queue the prefetch job
                dispatch(new PrefetchSearchResults($variation))->onQueue('low');
            }
        }
    }

    /**
     * Generate common filter variations for prefetching
     */
    private function generateFilterVariations(array $currentFilters): array
    {
        $variations = [];
        
        // Price range variations
        if (isset($currentFilters['minPrice'])) {
            $variations[] = $this->modifyFilter($currentFilters, 'minPrice', $currentFilters['minPrice'] - 50);
            $variations[] = $this->modifyFilter($currentFilters, 'minPrice', $currentFilters['minPrice'] + 50);
        }
        
        // Page variations
        if (isset($currentFilters['page'])) {
            $variations[] = $this->modifyFilter($currentFilters, 'page', $currentFilters['page'] + 1);
            if ($currentFilters['page'] > 1) {
                $variations[] = $this->modifyFilter($currentFilters, 'page', $currentFilters['page'] - 1);
            }
        }

        // Sort variations
        $commonSortOptions = ['newest', 'price_asc', 'price_desc', 'rating_desc'];
        foreach ($commonSortOptions as $sort) {
            if ((!isset($currentFilters['sortBy']) || $currentFilters['sortBy'] !== $sort)) {
                $variations[] = $this->modifyFilter($currentFilters, 'sortBy', $sort);
            }
        }

        return $variations;
    }

    /**
     * Create a new filter array with one modified value
     */
    private function modifyFilter(array $filters, string $key, $value): array
    {
        $newFilters = $filters;
        $newFilters[$key] = $value;
        return $newFilters;
    }

    /**
     * Get a unique key for a filter variation
     */
    private function getVariationKey(array $filters): string
    {
        return implode('_', array_map(
            fn($key, $value) => "{$key}-{$value}",
            array_keys($filters),
            array_values($filters)
        ));
    }

    /**
     * Clear outdated cache entries
     */
    public function clearOutdatedCache(): void
    {
        $keys = Cache::get('search_cache_keys', []);
        $now = now();
        
        foreach ($keys as $key => $timestamp) {
            if ($now->diffInHours($timestamp) > 24) {
                Cache::forget($key);
                unset($keys[$key]);
            }
        }
        
        Cache::put('search_cache_keys', $keys, self::CACHE_TTL);
    }
} 