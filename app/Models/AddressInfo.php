<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddressInfo extends Model {
	use HasFactory;

	protected $fillable = [
		'name',
		'email',
		'street',
		'city',
		'postal_code',
		'country',
		'phone'
	];

	public function user(): \Illuminate\Database\Eloquent\Relations\HasOne {
		return $this->hasOne(User::class, 'id_address_info');
	}
}
