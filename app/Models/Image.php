<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Image extends Model {

	protected $table = 'images';
	protected $fillable = [
		'name',
		'path',
	];
	protected $appends = ['full_path'];


	public function products() {
		return $this->belongsToMany(Product::class, 'product_images')
			->withPivot('order_num');
	}

	public function getFullPathAttribute() {
		return "storage/" . $this->path;
	}
}
