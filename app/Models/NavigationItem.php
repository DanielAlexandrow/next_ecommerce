<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NavigationItem extends Model
{
	use HasFactory;

	protected $table = 'navigation_item';

	public $timestamps = false;

	protected $fillable = [
		'name',
		'order_num',
		'description'
	];

	public function header()
	{
		return $this->belongsTo(Header::class);
	}

	public function categories()
	{
		return $this->belongsToMany(Category::class);
	}
}
