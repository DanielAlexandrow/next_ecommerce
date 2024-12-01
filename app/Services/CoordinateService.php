<?php

namespace App\Services;

use App\Interfaces\CoordinateServiceInterface;
use App\Models\Coordinate;

class CoordinateService implements CoordinateServiceInterface {
    /**
     * Save a new coordinate.
     *
     * @param int $userId
     * @param array $data
     * @return Coordinate
     * @throws \Exception
     */
    public function saveCoordinate(int $userId, array $data): Coordinate {
        // Check if coordinate already exists
        $coordinate = Coordinate::where('user_id', $userId)->first();

        if ($coordinate) {
            throw new \Exception('Coordinates already exist. Use update instead.');
        }

        return Coordinate::create([
            'user_id'  => $userId,
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'address'  => $data['address'] ?? null,
        ]);
    }

    /**
     * Update existing coordinate.
     *
     * @param int $userId
     * @param array $data
     * @return Coordinate
     */
    public function updateCoordinate(int $userId, array $data): Coordinate {
        $coordinate = Coordinate::where('user_id', $userId)->firstOrFail();

        $coordinate->update([
            'latitude' => $data['latitude'],
            'longitude' => $data['longitude'],
            'address'  => $data['address'] ?? null,
        ]);

        return $coordinate;
    }

    /**
     * Retrieve a user's coordinate.
     *
     * @param int $userId
     * @return Coordinate|null
     */
    public function getCoordinate(int $userId): ?Coordinate {
        return Coordinate::where('user_id', $userId)->first();
    }

    public function updateOrCreateCoordinates(int $userId, float $latitude, float $longitude): array {
        $coordinate = Coordinate::updateOrCreate(
            ['user_id' => $userId],
            [
                'latitude' => $latitude,
                'longitude' => $longitude,
            ]
        );

        return [
            'message' => 'Coordinates saved successfully',
            'data' => $coordinate
        ];
    }

    public function getDriverCoordinates(int $userId): ?array {
        $coordinate = Coordinate::where('user_id', $userId)->first();

        return $coordinate ? $coordinate->toArray() : null;
    }
}
