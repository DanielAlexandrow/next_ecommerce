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

	public function subproduct() {
		return $this->belongsTo(Subproduct::class);
	}
}
