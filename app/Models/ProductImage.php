<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
	use HasFactory;

	protected $table = 'product_images';

	public $timestamps = false;

	protected $fillable = [
		'product_id',
		'image_id',
		'order_num',
	];

	public function product()
	{
		return $this->belongsTo(Product::class, 'product_id');
	}

	public function image()
	{
		return $this->belongsTo(Image::class, 'image_id');
	}
}
