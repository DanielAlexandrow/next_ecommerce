<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model {
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'title',
        'content',
        'rating'
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    protected $with = ['user'];

    public static function boot()
    {
        parent::boot();

        static::saving(function ($review) {
            if ($review->rating < 1 || $review->rating > 5) {
                return false;
            }
        });
    }

    public function product(): BelongsTo {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
