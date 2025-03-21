<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;
use App\Models\CartItem;

class Cart extends Model {
    use HasFactory, SoftDeletes;

    protected $table = 'cart';

    protected $fillable = [
        'user_id',
        'session_id',
        'total',
        'currency',
        'status',
        'last_activity'
    ];

    protected $attributes = [
        'total' => 0,
        'currency' => 'USD',
        'status' => 'active'
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function cartItems() {
        return $this->hasMany(CartItem::class);
    }
}
