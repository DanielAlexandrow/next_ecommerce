<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'id_address_info'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Set the user's password.
     *
     * @param string $value
     * @return void
     */
    public function setPasswordAttribute($value) {
        if ($value && !Hash::verifyConfiguration($value)) {
            $this->attributes['password'] = Hash::make($value);
        } else {
            $this->attributes['password'] = $value;
        }
    }

    public function avatar(): string {
        return 'https://www.gravatar.com/avatar/' . md5(strtolower(trim($this->email))) . '?s=200&d=mp';
    }

    public function getAvatarAttribute(): string {
        return $this->avatar();
    }

    /**
     * Check if the user is an admin.
     *
     * @return bool
     */
    public function isAdmin(): bool {
        return $this->role === 'admin';
    }
    
    /**
     * Check if the user is a driver.
     *
     * @return bool
     */
    public function isDriver(): bool {
        return $this->role === 'driver';
    }

    public function addressInfo() {
        return $this->belongsTo(AddressInfo::class, 'id_address_info');
    }

    public function orders() {
        return $this->hasMany(Order::class);
    }

    public function coordinate() {
        return $this->hasOne(Coordinate::class);
    }
}
