<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subproduct extends Model
{
	use HasFactory;

	protected $table = 'subproducts';

	public $timestamps = false;

	protected $fillable = [
		'name',
		'price',
		'product_id',
		'available',
	];

	public function product()
	{
		return $this->belongsTo(Product::class, 'product_id');
	}

	public function images()
	{
		return $this->hasMany(SubproductImage::class, 'subproduct_id');
	}
}
