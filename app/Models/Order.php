<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model {
	use HasFactory;

	protected $fillable = [
		'user_id',
		'guest_id',
		'driver_id',
		'items',
		'total',
		'status',
		'payment_status',
		'shipping_status',
		'shipping_address',
		'billing_address'
	];

	protected $casts = [
		'items' => 'array',
		'shipping_address' => 'array',
		'billing_address' => 'array',
		'total' => 'float'
	];

	public function user(): BelongsTo {
		return $this->belongsTo(User::class);
	}

	public function guest(): BelongsTo {
		return $this->belongsTo(Guest::class);
	}

	public function driver(): BelongsTo {
		return $this->belongsTo(User::class, 'driver_id');
	}

	public function orderItems(): HasMany {
		return $this->hasMany(OrderItem::class);
	}
}
