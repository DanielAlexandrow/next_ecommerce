<?php

namespace App\Http\Controllers;

use App\Interfaces\CoordinateServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CoordinateController extends Controller {
    protected $coordinateService;

    public function __construct(CoordinateServiceInterface $coordinateService) {
        $this->coordinateService = $coordinateService;
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        return response()->json(
            $this->coordinateService->updateOrCreateCoordinates(
                Auth::id(),
                $validated['latitude'],
                $validated['longitude']
            )
        );
    }

    public function show() {
        $coordinates = $this->coordinateService->getDriverCoordinates(Auth::id());
        return response()->json($coordinates);
    }
}
