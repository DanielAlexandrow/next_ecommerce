<?php

namespace App\Services;

use App\Models\Deal;
use App\Models\Cart;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DealService {
    public function getDeals(array $filters = []) {
        $query = Deal::with(['products', 'categories', 'brands', 'subproducts']);

        if (isset($filters['active'])) {
            $query->active();
        }

        if (isset($filters['type'])) {
            $query->where('deal_type', $filters['type']);
        }

        if (isset($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['sortKey'])) {
            $query->orderBy($filters['sortKey'], $filters['sortDirection'] ?? 'asc');
        } else {
            $query->orderBy('start_date', 'desc');
        }

        return $query->paginate($filters['limit'] ?? 10);
    }

    public function createDeal(array $data) {
        return DB::transaction(function() use ($data) {
            $deal = Deal::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'discount_amount' => $data['discount_amount'],
                'discount_type' => $data['discount_type'],
                'start_date' => Carbon::parse($data['start_date']),
                'end_date' => Carbon::parse($data['end_date']),
                'active' => $data['active'] ?? true,
                'deal_type' => $data['deal_type'],
                'conditions' => $data['conditions'] ?? null,
                'metadata' => $data['metadata'] ?? null,
            ]);

            $this->syncDealRelations($deal, $data);

            return $deal->load(['products', 'categories', 'brands', 'subproducts']);
        });
    }

    public function updateDeal(Deal $deal, array $data) {
        return DB::transaction(function() use ($deal, $data) {
            $deal->update([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'discount_amount' => $data['discount_amount'],
                'discount_type' => $data['discount_type'],
                'start_date' => Carbon::parse($data['start_date']),
                'end_date' => Carbon::parse($data['end_date']),
                'active' => $data['active'] ?? true,
                'deal_type' => $data['deal_type'],
                'conditions' => $data['conditions'] ?? null,
                'metadata' => $data['metadata'] ?? null,
            ]);

            $this->syncDealRelations($deal, $data);

            return $deal->load(['products', 'categories', 'brands', 'subproducts']);
        });
    }

    private function syncDealRelations(Deal $deal, array $data) {
        switch ($deal->deal_type) {
            case 'product':
                if (isset($data['product_ids'])) {
                    $deal->products()->sync($data['product_ids']);
                }
                if (isset($data['subproduct_ids'])) {
                    // Instead of trying to use subproduct_id in the pivot table
                    // Let's modify this to attach products directly
                    $productIds = [];
                    foreach ($data['subproduct_ids'] as $subproductId) {
                        $subproduct = \App\Models\Subproduct::find($subproductId);
                        if ($subproduct) {
                            $productIds[] = $subproduct->product_id;
                        }
                    }
                    // Merge with any existing product_ids
                    if (!empty($productIds)) {
                        $productIds = array_unique(array_merge(
                            isset($data['product_ids']) ? $data['product_ids'] : [],
                            $productIds
                        ));
                        $deal->products()->sync($productIds);
                    }
                }
                break;
                
            case 'category':
                if (isset($data['category_ids'])) {
                    $deal->categories()->sync($data['category_ids']);
                }
                break;
                
            case 'brand':
                if (isset($data['brand_ids'])) {
                    $deal->brands()->sync($data['brand_ids']);
                }
                break;
        }
    }

    public function applyDealsToProduct($product) {
        $activeDeals = Deal::active()
            ->where(function($query) use ($product) {
                $query->whereHas('products', function($q) use ($product) {
                        $q->where('products.id', $product->id);
                    })
                    ->orWhereHas('categories', function($q) use ($product) {
                        $q->whereIn('categories.id', $product->categories->pluck('id'));
                    })
                    ->orWhereHas('brands', function($q) use ($product) {
                        $q->where('brands.id', $product->brand_id);
                    });
            })
            ->get();

        $bestDiscount = 0;
        $appliedDeal = null;

        foreach ($activeDeals as $deal) {
            $discount = $deal->discount_type === 'percentage' 
                ? $product->price * ($deal->discount_amount / 100)
                : $deal->discount_amount;
                
            if ($discount > $bestDiscount) {
                $bestDiscount = $discount;
                $appliedDeal = $deal;
            }
        }

        return [
            'original_price' => $product->price,
            'discount_amount' => $bestDiscount,
            'final_price' => $product->price - $bestDiscount,
            'applied_deal' => $appliedDeal
        ];
    }

    public function applyDealsToCart(Cart $cart) {
        $cartTotal = $cart->cartItems()
            ->join('subproducts', 'cart_items.subproduct_id', '=', 'subproducts.id')
            ->sum(DB::raw('subproducts.price * cart_items.quantity'));

        // Get all active deals
        $deals = Deal::where('active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->get();

        $bestDeal = null;
        $maxDiscount = 0;
        $applicableDeal = null;

        foreach ($deals as $deal) {
            // Check minimum amount condition
            if (isset($deal->conditions['minimum_amount']) && $cartTotal < $deal->conditions['minimum_amount']) {
                continue;
            }

            $discount = 0;
            if ($deal->discount_type === 'percentage') {
                $discount = $cartTotal * ($deal->discount_amount / 100);
            } else {
                $discount = $deal->discount_amount;
            }

            if ($discount > $maxDiscount) {
                $maxDiscount = $discount;
                $bestDeal = $deal;
            }
        }

        return [
            'original_total' => $cartTotal,
            'discount_amount' => $maxDiscount,
            'final_total' => $cartTotal - $maxDiscount,
            'applied_deal' => $bestDeal
        ];
    }
}