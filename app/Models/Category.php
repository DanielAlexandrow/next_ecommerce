<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Category extends Model
{


	protected $table = 'categories';
	public $timestamps = false;


	protected $fillable = [
		'name',
	];

	public function navigationItems()
	{
		return $this->belongsToMany(NavigationItem::class);
	}

	public function products()
	{
		return $this->belongsToMany(Product::class, 'product_categories');
	}
}
