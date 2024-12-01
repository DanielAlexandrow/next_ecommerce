<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShopSettings extends Model {
    use HasFactory;

    protected $fillable = [
        'currency',
        'mapbox_api_key',
        'sendgrid_api_key',
        'shop_name',
        'shop_logo',
    ];
}
