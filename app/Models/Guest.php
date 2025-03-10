<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Guest extends Model {
    use HasFactory;

    protected $fillable = [
        'id_address_info',
        'email',
        'phone'
    ];

    public function addressInfo(): BelongsTo {
        return $this->belongsTo(AddressInfo::class, 'id_address_info');
    }

    public function orders(): HasMany {
        return $this->hasMany(Order::class);
    }
}
