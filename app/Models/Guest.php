<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Guest extends Model {
	use HasFactory;

	protected $fillable = [
		'email',
		'phone',
		'name',
		'address',
		'city',
		'country',
		'postal_code'
	];

	public function orders(): HasMany {
		return $this->hasMany(Order::class);
	}
}
