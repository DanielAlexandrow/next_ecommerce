<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model {
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'discount',
        'available',
        'brand_id',  // Now nullable
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array',
        'available' => 'boolean',
        'discount' => 'float',
        'brand_id' => 'integer'
    ];

    protected $with = ['images', 'categories', 'brand', 'subproducts', 'reviews'];

    protected static function boot() {
        parent::boot();

        static::creating(function ($product) {
            $product->name = strip_tags($product->name);
            $product->description = strip_tags($product->description);
        });

        static::updating(function ($product) {
            $product->name = strip_tags($product->name);
            $product->description = strip_tags($product->description);
        });
    }

    public function subproducts(): HasMany {
        return $this->hasMany(Subproduct::class);
    }

    public function reviews(): HasMany {
        return $this->hasMany(Review::class);
    }

    public function brand(): BelongsTo {
        return $this->belongsTo(Brand::class);
    }

    public function categories(): BelongsToMany {
        return $this->belongsToMany(Category::class, 'product_categories');
    }

    public function images(): BelongsToMany {
        return $this->belongsToMany(Image::class, 'product_images')
            ->withPivot('order_num')
            ->orderBy('order_num');
    }

    public function getAverageRatingAttribute(): ?float {
        if ($this->reviews()->count() === 0) {
            return null;
        }

        return $this->reviews()->avg('rating');
    }
}
