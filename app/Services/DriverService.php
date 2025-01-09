<?php

namespace App\Services;

use App\Models\User;
use App\Interfaces\DriverServiceInterface;

class DriverService implements DriverServiceInterface {
    public function getPaginatedDrivers($sortKey = 'name', $sortDirection = 'asc') {
        return User::role('driver')
            ->with('coordinates')
            ->orderBy($sortKey, $sortDirection)
            ->paginate(10);
    }

    public function getDriverById($id) {
        return User::role('driver')
            ->with('coordinates')
            ->findOrFail($id);
    }
}
