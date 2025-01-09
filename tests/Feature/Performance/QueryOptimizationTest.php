<?php

namespace Tests\Feature\Performance;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Events\QueryExecuted;

class QueryOptimizationTest extends TestCase {
    use RefreshDatabase;

    private User $user;
    private const QUERY_THRESHOLD = 100; // 100ms threshold for queries
    private const MAX_QUERIES = 10; // Maximum number of queries allowed per request

    protected function setUp(): void {
        parent::setUp();
        $this->user = User::factory()->create();
        DB::flushQueryLog();
        DB::enableQueryLog();
    }

    /** @test */
    public function it_limits_number_of_queries() {
        // Create test data
        $category = Category::factory()->create();
        Product::factory()
            ->count(20)
            ->create(['category_id' => $category->id]);

        // Reset query log
        DB::flushQueryLog();

        // Make request
        $response = $this->getJson("/api/categories/{$category->id}/products");

        $queries = DB::getQueryLog();
        $this->assertLessThanOrEqual(
            self::MAX_QUERIES,
            count($queries),
            "Too many queries executed (" . count($queries) . ")"
        );
    }

    /** @test */
    public function it_verifies_eager_loading() {
        // Create test data with relationships
        $products = Product::factory()
            ->count(10)
            ->has(Review::factory()->count(5))
            ->create();

        // Reset query log
        DB::flushQueryLog();

        // Make request
        $response = $this->getJson('/api/products/with-reviews');

        $queries = DB::getQueryLog();

        // Should only have 2 queries (products + reviews)
        $this->assertCount(
            2,
            $queries,
            "N+1 problem detected - eager loading not implemented"
        );

        // Verify query execution time
        foreach ($queries as $query) {
            $this->assertLessThan(
                self::QUERY_THRESHOLD,
                $query['time'],
                "Query took too long: {$query['sql']}"
            );
        }
    }

    /** @test */
    public function it_uses_database_indexes() {
        // Create test data
        Product::factory()->count(1000)->create();

        // Reset query log
        DB::flushQueryLog();

        // Make request with where clause
        $response = $this->getJson('/api/products/search?name=test');

        $queries = DB::getQueryLog();
        foreach ($queries as $query) {
            $explainResults = DB::select("EXPLAIN " . $query['sql'], $query['bindings']);

            // Verify index usage
            $this->assertStringContainsString(
                'index',
                strtolower(json_encode($explainResults)),
                "Query not using indexes: {$query['sql']}"
            );
        }
    }

    /** @test */
    public function it_optimizes_pagination_queries() {
        // Create test data
        Product::factory()->count(1000)->create();

        $queryTimes = [];
        $pages = [1, 10, 50, 100];

        foreach ($pages as $page) {
            DB::flushQueryLog();

            $start = microtime(true);
            $response = $this->getJson("/api/products?page={$page}");
            $duration = (microtime(true) - $start) * 1000;

            $queryTimes[$page] = $duration;
        }

        // Verify consistent query times regardless of page number
        $avgTime = array_sum($queryTimes) / count($queryTimes);
        foreach ($queryTimes as $page => $time) {
            $this->assertLessThan(
                $avgTime * 1.5, // Allow 50% deviation
                $time,
                "Query time increases significantly for page {$page}"
            );
        }
    }

    /** @test */
    public function it_uses_query_caching() {
        Product::factory()->count(100)->create();

        // First query
        DB::flushQueryLog();
        $response = $this->getJson('/api/products');
        $firstQueries = DB::getQueryLog();

        // Second query (should use query cache)
        DB::flushQueryLog();
        $response = $this->getJson('/api/products');
        $secondQueries = DB::getQueryLog();

        $this->assertLessThan(
            count($firstQueries),
            count($secondQueries),
            "Query cache not effective"
        );
    }

    /** @test */
    public function it_optimizes_sorting_queries() {
        // Create test data
        Product::factory()->count(1000)->create();

        $sortFields = ['name', 'price', 'created_at'];
        $queryTimes = [];

        foreach ($sortFields as $field) {
            DB::flushQueryLog();

            $start = microtime(true);
            $response = $this->getJson("/api/products?sort={$field}");
            $duration = (microtime(true) - $start) * 1000;

            $queries = DB::getQueryLog();
            $queryTimes[$field] = [
                'duration' => $duration,
                'query_count' => count($queries)
            ];

            // Verify index usage for sorting
            foreach ($queries as $query) {
                $explainResults = DB::select("EXPLAIN " . $query['sql'], $query['bindings']);
                $this->assertStringContainsString(
                    'index',
                    strtolower(json_encode($explainResults)),
                    "Sorting not using indexes for field: {$field}"
                );
            }
        }

        // Verify consistent performance across sort fields
        $avgTime = array_sum(array_column($queryTimes, 'duration')) / count($sortFields);
        foreach ($queryTimes as $field => $metrics) {
            $this->assertLessThan(
                $avgTime * 1.5,
                $metrics['duration'],
                "Sort performance varies significantly for field: {$field}"
            );
        }
    }

    /** @test */
    public function it_handles_complex_joins_efficiently() {
        // Create test data with relationships
        $categories = Category::factory()
            ->count(10)
            ->has(
                Product::factory()
                    ->count(10)
                    ->has(Review::factory()->count(5))
            )
            ->create();

        DB::flushQueryLog();

        // Make request with complex joins
        $response = $this->getJson('/api/categories/with-stats');

        $queries = DB::getQueryLog();

        // Verify query count
        $this->assertLessThanOrEqual(
            3, // Should use subqueries or efficient joins
            count($queries),
            "Too many queries for complex join operation"
        );

        // Verify execution time
        foreach ($queries as $query) {
            $this->assertLessThan(
                self::QUERY_THRESHOLD,
                $query['time'],
                "Complex join query took too long"
            );
        }
    }

    /** @test */
    public function it_uses_efficient_aggregates() {
        // Create test data
        $products = Product::factory()
            ->count(100)
            ->has(Review::factory()->count(10))
            ->create();

        DB::flushQueryLog();

        // Make request with aggregates
        $response = $this->getJson('/api/products/stats');

        $queries = DB::getQueryLog();

        // Verify efficient aggregate queries
        foreach ($queries as $query) {
            // Check for subqueries in aggregates
            $this->assertStringNotContainsString(
                'SELECT *',
                $query['sql'],
                "Inefficient aggregate query detected"
            );

            // Verify execution time
            $this->assertLessThan(
                self::QUERY_THRESHOLD,
                $query['time'],
                "Aggregate query took too long"
            );
        }
    }

    /** @test */
    public function it_handles_search_queries_efficiently() {
        // Create test data
        Product::factory()->count(1000)->create();

        $searchTerms = ['test', 'product', 'special'];
        $queryMetrics = [];

        foreach ($searchTerms as $term) {
            DB::flushQueryLog();

            $start = microtime(true);
            $response = $this->getJson("/api/products/search?q={$term}");
            $duration = (microtime(true) - $start) * 1000;

            $queries = DB::getQueryLog();
            $queryMetrics[$term] = [
                'duration' => $duration,
                'query_count' => count($queries)
            ];

            // Verify search optimization
            foreach ($queries as $query) {
                // Check for LIKE with wildcards at start
                $this->assertStringNotContainsString(
                    'LIKE \'%',
                    $query['sql'],
                    "Inefficient wildcard search detected"
                );

                // Verify execution time
                $this->assertLessThan(
                    self::QUERY_THRESHOLD,
                    $query['time'],
                    "Search query took too long"
                );
            }
        }

        // Verify consistent performance
        $avgTime = array_sum(array_column($queryMetrics, 'duration')) / count($searchTerms);
        foreach ($queryMetrics as $term => $metrics) {
            $this->assertLessThan(
                $avgTime * 1.5,
                $metrics['duration'],
                "Search performance varies significantly for term: {$term}"
            );
        }
    }

    /** @test */
    public function it_optimizes_bulk_operations() {
        // Prepare bulk data
        $products = Product::factory()->count(100)->make()->toArray();

        DB::flushQueryLog();

        // Perform bulk insert
        $start = microtime(true);
        $response = $this->actingAs($this->user)
            ->postJson('/api/products/bulk', ['products' => $products]);
        $duration = (microtime(true) - $start) * 1000;

        $queries = DB::getQueryLog();

        // Verify bulk operation efficiency
        $this->assertLessThanOrEqual(
            5, // Should use chunk inserts
            count($queries),
            "Too many queries for bulk operation"
        );

        // Verify execution time
        $this->assertLessThan(
            self::QUERY_THRESHOLD * 2, // Allow higher threshold for bulk ops
            $duration,
            "Bulk operation took too long"
        );
    }
}
