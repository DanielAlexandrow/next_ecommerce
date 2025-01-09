<?php

namespace App\Interfaces;

interface DriverServiceInterface {
    public function getPaginatedDrivers(string $sortKey = 'name', string $sortDirection = 'asc');
    public function getDriverById($id);
}
