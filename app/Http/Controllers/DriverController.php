<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\DriverService;
use Illuminate\Http\Request;

class DriverController extends Controller {
    private $driverService;

    public function __construct(DriverService $driverService) {
        $this->driverService = $driverService;
    }

    public function index(Request $request) {
        $sortKey = $request->query('sortkey', 'name');
        $sortDirection = $request->query('sortdirection', 'asc');
        $page = $request->query('page', 1);

        $drivers = $this->driverService->getPaginatedDrivers($sortKey, $sortDirection);

        return Inertia::render('Driver/DriverCoordinatesPage', [
            'drivers' => $drivers,
            'sortkey' => $sortKey,
            'sortdirection' => $sortDirection
        ]);
    }
}
