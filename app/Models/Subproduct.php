<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subproduct extends Model {
	use HasFactory;

	protected $fillable = [
		'product_id',
		'name',
		'description',
		'price',
		'stock',
		'sku',
		'weight',
		'dimensions',
		'metadata'
	];

	protected $casts = [
		'price' => 'decimal:2',
		'weight' => 'decimal:2',
		'dimensions' => 'array',
		'metadata' => 'array'
	];

	protected static function boot() {
		parent::boot();

		static::creating(function ($subproduct) {
			$subproduct->name = strip_tags($subproduct->name);
		});

		static::updating(function ($subproduct) {
			$subproduct->name = strip_tags($subproduct->name);
		});
	}

	public function product(): BelongsTo {
		return $this->belongsTo(Product::class);
	}
}
