<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * READ-ONLY: This pivot model has verified tests and should not be modified without approval.
 * @see API_DOCUMENTATION.md#categories-read-only for details
 */
class ProductCategory extends Model
{
	use HasFactory;
	public $timestamps = false;
	protected $table = 'product_categories';

	protected $fillable = [
		'product_id',
		'category_id',
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}

	public function category()
	{
		return $this->belongsTo(Category::class);
	}
}
