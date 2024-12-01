
<?php

namespace App\Interfaces;

interface CoordinateServiceInterface {
    public function updateOrCreateCoordinates(int $userId, float $latitude, float $longitude): array;
    public function getDriverCoordinates(int $userId): ?array;
}
