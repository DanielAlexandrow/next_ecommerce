<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Header extends Model
{
	use HasFactory;

	protected $table = 'headers';

	public $timestamps = false;


	protected $fillable = [
		'name',
		'order_num',
	];

	public function navigationItems()
	{
		return $this->hasMany(NavigationItem::class);
	}
}
