<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AddressInfo;

class Guest extends Model
{
	use HasFactory;

	protected $fillable = [
		'id_address_info',
	];

	public function addressInfo()
	{
		return $this->belongsTo(AddressInfo::class, 'id_address_info');
	}

	public function orders()
	{
		return $this->hasMany(Order::class, 'guest_id');
	}
}
