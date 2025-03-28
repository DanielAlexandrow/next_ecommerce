<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Deal extends Model {
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'discount_amount',
        'discount_type',
        'start_date',
        'end_date',
        'active',
        'deal_type',
        'conditions',
        'metadata'
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'active' => 'boolean',
        'conditions' => 'array',
        'metadata' => 'array',
        'start_date' => 'datetime',
        'end_date' => 'datetime'
    ];

    public function products(): BelongsToMany {
        return $this->belongsToMany(Product::class, 'deal_products');
    }

    public function categories(): BelongsToMany {
        return $this->belongsToMany(Category::class, 'deal_categories');
    }

    public function brands(): BelongsToMany {
        return $this->belongsToMany(Brand::class, 'deal_brands');
    }

    public function subproducts(): BelongsToMany {
        return $this->belongsToMany(Subproduct::class, 'deal_products');
    }

    public function scopeActive($query) {
        return $query->where('active', true)
                    ->where('start_date', '<=', now())
                    ->where('end_date', '>=', now());
    }
}