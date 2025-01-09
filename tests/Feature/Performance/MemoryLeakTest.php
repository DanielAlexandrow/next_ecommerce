<?php

namespace Tests\Feature\Performance;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class MemoryLeakTest extends TestCase {
    use RefreshDatabase;

    private User $user;
    private const MEMORY_THRESHOLD = 50 * 1024 * 1024; // 50MB threshold
    private const MEMORY_LEAK_THRESHOLD = 1 * 1024 * 1024; // 1MB threshold for leaks
    private const ITERATIONS = 10; // Number of iterations for leak detection

    protected function setUp(): void {
        parent::setUp();
        $this->user = User::factory()->create();

        // Clear caches and collect garbage
        Cache::flush();
        gc_collect_cycles();
    }

    /** @test */
    public function it_detects_memory_leaks_in_product_listing() {
        // Create test data
        Product::factory()->count(100)->create();

        $memoryUsage = [];

        // Make repeated requests
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            $response = $this->getJson('/api/products');

            // Force garbage collection
            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;

            // Clear any caches between iterations
            Cache::flush();
        }

        // Check for memory growth pattern
        $memoryGrowth = end($memoryUsage) - reset($memoryUsage);
        $this->assertLessThan(
            self::MEMORY_LEAK_THRESHOLD,
            $memoryGrowth,
            "Memory usage growing over iterations - potential memory leak"
        );
    }

    /** @test */
    public function it_detects_memory_leaks_in_complex_queries() {
        // Create test data with relationships
        $categories = Category::factory()
            ->count(10)
            ->has(
                Product::factory()
                    ->count(10)
                    ->has(Review::factory()->count(5))
            )
            ->create();

        $memoryUsage = [];

        // Make repeated requests with complex joins
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            $response = $this->getJson('/api/categories/with-stats');

            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;

            Cache::flush();
            DB::flushQueryLog();
        }

        // Analyze memory usage pattern
        $averageUsage = array_sum($memoryUsage) / count($memoryUsage);
        foreach ($memoryUsage as $index => $usage) {
            $this->assertLessThan(
                $averageUsage * 1.5, // Allow 50% deviation
                $usage,
                "Memory usage spike detected in iteration {$index}"
            );
        }
    }

    /** @test */
    public function it_detects_memory_leaks_in_file_operations() {
        $memoryUsage = [];
        $testFile = storage_path('test.txt');

        // Create a large test file
        file_put_contents($testFile, str_repeat('a', 1024 * 1024)); // 1MB file

        // Perform repeated file operations
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            // Simulate file upload processing
            $response = $this->actingAs($this->user)
                ->post('/api/files/process', [
                    'file' => new \Illuminate\Http\UploadedFile(
                        $testFile,
                        'test.txt',
                        'text/plain',
                        null,
                        true
                    )
                ]);

            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;
        }

        // Clean up
        @unlink($testFile);

        // Check for memory leaks
        $memoryGrowth = end($memoryUsage) - reset($memoryUsage);
        $this->assertLessThan(
            self::MEMORY_LEAK_THRESHOLD,
            $memoryGrowth,
            "Memory leak detected in file operations"
        );
    }

    /** @test */
    public function it_detects_memory_leaks_in_cache_operations() {
        // Create test data
        $products = Product::factory()->count(100)->create();

        $memoryUsage = [];

        // Perform repeated cache operations
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            // Cache complex data structure
            Cache::remember("products_test_{$i}", 60, function () use ($products) {
                return $products->map(function ($product) {
                    return [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'computed_value' => str_repeat('a', 1000), // Simulate computed data
                    ];
                });
            });

            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;

            // Clear cache after each iteration
            Cache::flush();
        }

        // Analyze memory pattern
        $this->assertLessThan(
            self::MEMORY_THRESHOLD,
            max($memoryUsage),
            "Memory usage exceeds threshold in cache operations"
        );
    }

    /** @test */
    public function it_detects_memory_leaks_in_session_handling() {
        $memoryUsage = [];

        // Simulate session operations
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            // Perform session-heavy operations
            $response = $this->actingAs($this->user)
                ->get('/api/user/preferences');

            $this->session([
                'test_data_' . $i => str_repeat('a', 1000), // Add session data
            ]);

            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;

            // Clear session after each iteration
            $this->session()->flush();
        }

        // Check for memory growth
        $memoryGrowth = end($memoryUsage) - reset($memoryUsage);
        $this->assertLessThan(
            self::MEMORY_LEAK_THRESHOLD,
            $memoryGrowth,
            "Memory leak detected in session handling"
        );
    }

    /** @test */
    public function it_detects_memory_leaks_in_event_handling() {
        $memoryUsage = [];

        // Create test data
        $product = Product::factory()->create();

        // Monitor memory during event dispatching
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            // Trigger events
            $response = $this->actingAs($this->user)
                ->putJson("/api/products/{$product->id}", [
                    'name' => "Updated Name {$i}"
                ]);

            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;

            // Clear event listeners if possible
            event()->flush('product.updated');
        }

        // Analyze memory pattern
        $averageUsage = array_sum($memoryUsage) / count($memoryUsage);
        foreach ($memoryUsage as $index => $usage) {
            $this->assertLessThan(
                $averageUsage * 1.5,
                $usage,
                "Memory spike detected in event handling iteration {$index}"
            );
        }
    }

    /** @test */
    public function it_detects_memory_leaks_in_queue_processing() {
        $memoryUsage = [];

        // Create test jobs
        $products = Product::factory()->count(10)->create();

        // Monitor memory during queue processing
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            // Dispatch jobs
            foreach ($products as $product) {
                dispatch(new \App\Jobs\ProcessProduct($product));
            }

            // Process the queue
            $this->artisan('queue:work', ['--once' => true]);

            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;
        }

        // Check for memory leaks
        $memoryGrowth = end($memoryUsage) - reset($memoryUsage);
        $this->assertLessThan(
            self::MEMORY_LEAK_THRESHOLD,
            $memoryGrowth,
            "Memory leak detected in queue processing"
        );
    }

    /** @test */
    public function it_detects_memory_leaks_in_model_observers() {
        $memoryUsage = [];

        // Create test data
        $product = Product::factory()->create();

        // Monitor memory during model operations
        for ($i = 0; $i < self::ITERATIONS; $i++) {
            $memoryBefore = memory_get_usage(true);

            // Perform model operations that trigger observers
            $product->update([
                'name' => "Updated Name {$i}",
                'description' => str_repeat('a', 1000), // Large content
            ]);

            gc_collect_cycles();
            $memoryAfter = memory_get_usage(true);

            $memoryUsage[] = $memoryAfter - $memoryBefore;
        }

        // Analyze memory pattern
        $this->assertLessThan(
            self::MEMORY_THRESHOLD,
            max($memoryUsage),
            "Memory usage exceeds threshold in model observers"
        );
    }
}
