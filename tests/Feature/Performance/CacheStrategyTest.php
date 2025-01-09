<?php

namespace Tests\Feature\Performance;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class CacheStrategyTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private const CACHE_THRESHOLD = 50; // 50ms threshold for cached responses
    private const CACHE_HIT_RATIO_THRESHOLD = 0.8; // 80% cache hit ratio expected

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();

        // Clear caches
        Cache::flush();
        if (Redis::connection()->isConnected()) {
            Redis::flushall();
        }
    }

    /** @test */
    public function it_verifies_product_list_caching()
    {
        // Create test data
        Product::factory()->count(100)->create();

        // First request (cache miss)
        $start = microtime(true);
        $response = $this->getJson('/api/products');
        $uncachedDuration = (microtime(true) - $start) * 1000;

        // Second request (cache hit)
        $start = microtime(true);
        $response = $this->getJson('/api/products');
        $cachedDuration = (microtime(true) - $start) * 1000;

        // Verify cache effectiveness
        $this->assertLessThan(
            $uncachedDuration * 0.5, // Should be at least 50% faster
            $cachedDuration,
            "Cache is not providing significant performance improvement"
        );

        $this->assertLessThan(
            self::CACHE_THRESHOLD,
            $cachedDuration,
            "Cached response too slow ({$cachedDuration}ms)"
        );
    }

    /** @test */
    public function it_handles_cache_invalidation()
    {
        $product = Product::factory()->create();
        $cacheKey = "product_{$product->id}";

        // Cache initial data
        $response = $this->getJson("/api/products/{$product->id}");
        $initialEtag = $response->headers->get('ETag');

        // Update product
        $product->name = 'Updated Name';
        $product->save();

        // Verify cache invalidation
        $response = $this->getJson("/api/products/{$product->id}");
        $newEtag = $response->headers->get('ETag');

        $this->assertNotEquals(
            $initialEtag,
            $newEtag,
            "Cache was not properly invalidated after update"
        );
    }

    /** @test */
    public function it_measures_cache_hit_ratio()
    {
        Product::factory()->count(50)->create();
        $totalRequests = 100;
        $cacheHits = 0;

        // Make repeated requests
        for ($i = 0; $i < $totalRequests; $i++) {
            $start = microtime(true);
            $response = $this->getJson('/api/products');
            $duration = (microtime(true) - $start) * 1000;

            if ($duration < self::CACHE_THRESHOLD) {
                $cacheHits++;
            }
        }

        $hitRatio = $cacheHits / $totalRequests;
        $this->assertGreaterThan(
            self::CACHE_HIT_RATIO_THRESHOLD,
            $hitRatio,
            "Cache hit ratio too low ({$hitRatio})"
        );
    }

    /** @test */
    public function it_verifies_cache_tags()
    {
        $category = Category::factory()->create();
        $products = Product::factory()
            ->count(5)
            ->create(['category_id' => $category->id]);

        // Cache category products
        $this->getJson("/api/categories/{$category->id}/products");

        // Update one product
        $products[0]->name = 'Updated Name';
        $products[0]->save();

        // Verify only related cache is invalidated
        $start = microtime(true);
        $response = $this->getJson("/api/categories/{$category->id}/products");
        $duration = (microtime(true) - $start) * 1000;

        $this->assertGreaterThan(
            self::CACHE_THRESHOLD,
            $duration,
            "Cache was not invalidated for related data"
        );

        // Other category should still be cached
        $otherCategory = Category::factory()->create();
        $start = microtime(true);
        $response = $this->getJson("/api/categories/{$otherCategory->id}/products");
        $duration = (microtime(true) - $start) * 1000;

        $this->assertLessThan(
            self::CACHE_THRESHOLD,
            $duration,
            "Unrelated cache was invalidated"
        );
    }

    /** @test */
    public function it_handles_cache_stampede()
    {
        Product::factory()->count(100)->create();
        Cache::flush();

        // Simulate concurrent requests after cache expiration
        $promises = [];
        for ($i = 0; $i < 10; $i++) {
            $promises[] = async(function() {
                return $this->getJson('/api/products');
            });
        }

        $responses = await($promises);
        
        // Verify all requests received same data
        $firstResponse = $responses[0]->json();
        foreach ($responses as $response) {
            $this->assertEquals(
                $firstResponse,
                $response->json(),
                "Cache stampede protection failed - inconsistent data"
            );
        }
    }

    /** @test */
    public function it_implements_cache_warming()
    {
        // Create test data
        $products = Product::factory()->count(20)->create();
        Cache::flush();

        // Warm up cache
        $this->artisan('cache:warm');

        // Measure response times for common requests
        $timings = [];
        foreach ($products as $product) {
            $start = microtime(true);
            $response = $this->getJson("/api/products/{$product->id}");
            $duration = (microtime(true) - $start) * 1000;

            $timings[] = $duration;
        }

        // All responses should be fast (cached)
        $slowResponses = collect($timings)->filter(fn($t) => $t > self::CACHE_THRESHOLD)->count();
        $this->assertEquals(
            0,
            $slowResponses,
            "Cache warming was not effective"
        );
    }

    /** @test */
    public function it_handles_cache_race_conditions()
    {
        $product = Product::factory()->create();

        // Simulate concurrent cache updates
        $promises = [];
        for ($i = 0; $i < 5; $i++) {
            $promises[] = async(function() use ($product) {
                return $this->actingAs($this->user)
                    ->putJson("/api/products/{$product->id}", [
                        'name' => "Updated Name {$i}"
                    ]);
            });
        }

        $responses = await($promises);
        
        // Verify cache consistency
        $finalResponse = $this->getJson("/api/products/{$product->id}");
        $cachedName = $finalResponse->json('name');
        
        $product->refresh();
        $this->assertEquals(
            $product->name,
            $cachedName,
            "Cache is inconsistent with database after concurrent updates"
        );
    }

    /** @test */
    public function it_measures_cache_memory_usage()
    {
        // Create large dataset
        Product::factory()->count(1000)->create();

        // Measure memory before caching
        $memoryBefore = memory_get_usage(true);

        // Cache all products
        for ($i = 0; $i < 10; $i++) {
            $this->getJson("/api/products?page=$i");
        }

        // Measure memory after caching
        $memoryAfter = memory_get_usage(true);
        $memoryIncrease = $memoryAfter - $memoryBefore;

        // Memory increase should be reasonable
        $this->assertLessThan(
            50 * 1024 * 1024, // 50MB limit
            $memoryIncrease,
            "Cache is consuming too much memory"
        );
    }

    /** @test */
    public function it_verifies_cache_persistence()
    {
        Product::factory()->count(100)->create();

        // Cache data
        $this->getJson('/api/products');

        // Simulate server restart
        Cache::flush();
        if (Redis::connection()->isConnected()) {
            Redis::flushall();
        }

        // Verify persistent cache recovery
        $start = microtime(true);
        $response = $this->getJson('/api/products');
        $duration = (microtime(true) - $start) * 1000;

        $this->assertLessThan(
            self::CACHE_THRESHOLD,
            $duration,
            "Persistent cache not recovered after restart"
        );
    }
} 