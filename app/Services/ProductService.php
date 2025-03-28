<?php

namespace App\Services;

use App\Interfaces\ProductServiceInterface;
use App\Models\Product;
use App\Models\Subproduct;
use App\Models\OrderItem;
use App\Exceptions\ProductHasOrdersException;
use Illuminate\Support\Facades\DB;
use App\Models\SearchHistory;
use App\Models\PopularSearch;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductService implements ProductServiceInterface
{
    public function getPaginatedProducts(string $sortKey, string $sortDirection, int $limit)
    {
        $paginator = Product::with(['brand', 'categories', 'subproducts'])
            ->orderBy($sortKey, $sortDirection)
            ->paginate($limit);
        
        return $paginator->toArray();
    }

    public function create(array $data): Product
    {
        return DB::transaction(function () use ($data) {
            // Create the product
            $product = Product::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'brand_id' => $data['brand_id'],
                'available' => $data['available'] ?? true,
                'metadata' => $data['metadata'] ?? null,
            ]);

            // Attach categories if provided
            if (!empty($data['categories'])) {
                $product->categories()->attach($data['categories']);
            }

            // Create subproducts if provided
            if (!empty($data['subproducts'])) {
                foreach ($data['subproducts'] as $subproductData) {
                    $product->subproducts()->create([
                        'name' => $subproductData['name'],
                        'price' => $subproductData['price'],
                        'stock' => $subproductData['stock'] ?? 0,
                        'available' => $subproductData['available'] ?? true,
                        'sku' => $subproductData['sku'] ?? null
                    ]);
                }
            }

            // Refresh the model to load relationships
            $product->load(['brand', 'categories', 'subproducts']);

            return $product;
        });
    }

    public function createProduct(array $data)
    {
        return DB::transaction(function () use ($data) {
            $product = Product::create([
                'name' => $data['name'],
                'description' => $data['description'],
                'brand_id' => $data['brand_id'],
                'available' => $data['available'] ?? true,
                'metadata' => $data['metadata'] ?? null,
            ]);

            if (!empty($data['categories'])) {
                $product->categories()->attach($data['categories']);
            }

            if (!empty($data['subproducts'])) {
                foreach ($data['subproducts'] as $subproductData) {
                    $product->subproducts()->create($subproductData);
                }
            }

            return $product->load(['brand', 'categories', 'subproducts']);
        });
    }

    public function update(array $data, int $id)
    {
        return DB::transaction(function () use ($data, $id) {
            $product = Product::findOrFail($id);
            $product->update($data);

            if (isset($data['categories'])) {
                $product->categories()->sync($data['categories']);
            }

            return $product->load(['brand', 'categories', 'subproducts']);
        });
    }

    public function delete(int $id): bool
    {
        $product = Product::findOrFail($id);
        
        // Check if any subproduct of this product is in any order
        $hasOrders = DB::table('order_items')
            ->join('subproducts', 'order_items.subproduct_id', '=', 'subproducts.id')
            ->where('subproducts.product_id', $id)
            ->exists();
            
        if ($hasOrders) {
            throw new ProductHasOrdersException('Cannot delete product with existing orders');
        }
        
        return $product->delete();
    }

    /**
     * Track search history for a user
     */
    public function trackSearchHistory(string $searchTerm, ?int $userId): void {
        if ($userId) {
            SearchHistory::create([
                'user_id' => $userId,
                'search_term' => $searchTerm,
                'created_at' => now()
            ]);

            // Update popular searches - SQLite compatible version
            $popularSearch = PopularSearch::where('search_term', $searchTerm)->first();
            
            if ($popularSearch) {
                $popularSearch->increment('count');
            } else {
                PopularSearch::create([
                    'search_term' => $searchTerm,
                    'count' => 1
                ]);
            }
        }
    }

    /**
     * Get popular search terms
     */
    public function getPopularSearchTerms(int $limit = 10): array {
        return Cache::remember('popular_searches', 3600, function () use ($limit) {
            return PopularSearch::orderBy('count', 'desc')
                ->limit($limit)
                ->pluck('search_term')
                ->toArray();
        });
    }

    /**
     * Get related products based on categories and tags
     */
    public function getRelatedProducts(int $productId, int $limit = 5): array {
        $product = Product::findOrFail($productId);

        return Cache::remember("related_products_{$productId}", 3600, function () use ($product, $limit) {
            return Product::with(['images', 'brand'])
                ->whereHas('categories', function ($query) use ($product) {
                    $query->whereIn('categories.id', $product->categories->pluck('id'));
                })
                ->where('id', '!=', $product->id)
                ->orderByRaw(config('database.default') === 'sqlite' ? 'RANDOM()' : 'RAND()')
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Get paginated products for the store with transition optimization
     */
    public function getPaginatedStoreProducts(array $filters): array {
        try {
            $query = Product::with(['images', 'subproducts', 'reviews', 'brand', 'categories'])
                ->select('products.*')
                ->leftJoin('subproducts', 'products.id', '=', 'subproducts.product_id')
                ->leftJoin('reviews', 'products.id', '=', 'reviews.product_id')
                ->groupBy(
                    'products.id',
                    'products.name',
                    'products.description',
                    'products.brand_id',
                    'products.available',
                    'products.created_at',
                    'products.updated_at'
                );

            // Add subproduct price to selection with fallback to 0
            $query->addSelect(DB::raw('COALESCE(MIN(NULLIF(subproducts.price, 0)), 0) as min_price'));
            $query->addSelect(DB::raw('COALESCE(MAX(NULLIF(subproducts.price, 0)), 0) as max_price'));
            $query->addSelect(DB::raw('COALESCE(AVG(NULLIF(reviews.rating, 0)), 0) as average_rating'));

            // Enhanced text search with relevance scoring
            if (!empty($filters['name'])) {
                $searchTerm = $filters['name'];
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('products.name', 'LIKE', "%{$searchTerm}%")
                        ->orWhere('products.description', 'LIKE', "%{$searchTerm}%");
                });
            }

            // Price range filter
            if (isset($filters['minPrice']) && $filters['minPrice'] > 0) {
                $query->having(DB::raw('COALESCE(MIN(NULLIF(subproducts.price, 0)), 0)'), '>=', $filters['minPrice']);
            }
            if (isset($filters['maxPrice']) && $filters['maxPrice'] > 0) {
                $query->having(DB::raw('COALESCE(MAX(NULLIF(subproducts.price, 0)), 0)'), '<=', $filters['maxPrice']);
            }

            // Category filter
            if (!empty($filters['category'])) {
                $query->whereHas('categories', function ($q) use ($filters) {
                    $q->where('categories.id', $filters['category']);
                });
            }

            // Brand filter
            if (!empty($filters['brand'])) {
                $query->where('brand_id', $filters['brand']);
            }

            // Rating filter
            if (!empty($filters['rating'])) {
                $query->having('average_rating', '>=', $filters['rating']);
            }

            // Stock filter
            if (isset($filters['inStock']) && $filters['inStock']) {
                $query->whereHas('subproducts', function ($q) {
                    $q->where('available', true)
                        ->where('stock', '>', 0);
                });
            }

            // Enhanced sorting with search relevance
            $sortKey = $filters['sortKey'] ?? 'created_at';
            $sortDirection = $filters['sortDirection'] ?? 'desc';

            switch ($sortKey) {
                case 'price':
                    $query->orderBy(DB::raw('COALESCE(MIN(NULLIF(subproducts.price, 0)), 0)'), $sortDirection);
                    break;
                case 'average_rating':
                    $query->orderBy('average_rating', $sortDirection);
                    break;
                case 'popularity':
                    $query->addSelect(DB::raw('COALESCE((
                        SELECT COUNT(*) 
                        FROM order_items 
                        WHERE order_items.product_id = products.id
                    ), 0) as popularity'))
                        ->orderBy('popularity', $sortDirection);
                    break;
                default:
                    $query->orderBy("products.{$sortKey}", $sortDirection);
            }

            $paginatedResults = $query->paginate($filters['limit'] ?? 12);

            if (!$paginatedResults) {
                throw new \Exception('Failed to paginate products');
            }

            // Transform the results to include proper price
            $results = $paginatedResults->toArray();
            $results['data'] = array_map(function ($product) {
                $product['price'] = $product['min_price'] ?? 0;
                unset($product['min_price'], $product['max_price']);
                return $product;
            }, $results['data']);

            // Add metadata
            $results['meta'] = [
                'total_products' => Product::count(),
                'filter_stats' => $this->getFilterStats($filters)
            ];

            return $results;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Get statistics about current filters
     */
    private function getFilterStats(array $filters): array {
        return [
            'price_range' => [
                'min' => DB::table('subproducts')->min('price'),
                'max' => DB::table('subproducts')->max('price'),
                'avg' => DB::table('subproducts')->avg('price')
            ],
            'rating_distribution' => DB::table('reviews')
                ->select('rating', DB::raw('COUNT(*) as count'))
                ->groupBy('rating')
                ->get()
                ->pluck('count', 'rating')
                ->toArray()
        ];
    }
}
