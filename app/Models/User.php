<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Models\Coordinate;

class User extends Authenticatable implements MustVerifyEmail {
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'name',
        'email',
        'password',
        'id_address_info',
        'role',

    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function avatar(): string {
        return 'https://www.gravatar.com/avatar/' . md5(strtolower(trim($this->email))) . '?s=200&d=mp';
    }

    public function addressInfo() {
        return $this->hasOne(AddressInfo::class, 'id', 'id_address_info');
    }
    public function orders() {
        return $this->hasMany(Order::class, 'user_id');
    }

    /**
     * Get the coordinate associated with the driver.
     */
    public function coordinate() {
        return $this->hasOne(Coordinate::class);
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool {
        return $this->role === 'admin';
    }

    /**
     * Check if the user is a driver.
     */
    public function isDriver(): bool {
        return $this->role === 'driver';
    }
}
