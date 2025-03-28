<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Subproduct;
use App\Models\User;

class CartItem extends Model {
    use HasFactory;

    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id',
        'subproduct_id',
        'quantity'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'cart_id' => 'integer',
        'subproduct_id' => 'integer'
    ];

    public function subproduct() {
        return $this->belongsTo(Subproduct::class);
    }

    public function cart() {
        return $this->belongsTo(Cart::class);
    }
}
