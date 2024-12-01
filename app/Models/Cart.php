<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;


class Cart extends Model
{
	protected $table = 'cart';

	protected $fillable = [
		'user_id',
	];


	public function user()
	{
		return $this->hasOne(User::class);
	}

	public function cartitems()
	{
		return $this->hasMany(CartItem::class);
	}
}
