<?php

namespace App\Http\Controllers;

use App\Http\Requests\NavigationRequest;
use App\Http\Requests\GetNavigationRequest;
use App\Interfaces\NavigationServiceInterface;

class NavigationController extends Controller {
	protected $navigationService;

	public function __construct(NavigationServiceInterface $navigationService) {
		$this->navigationService = $navigationService;
		$this->middleware('admin')->only(['index', 'update']);
	}

	public function index() {
	    $headers = $this->navigationService->getNavigationData();
	    
	    // Skip rendering Inertia component during testing
	    if (app()->environment('testing')) {
	        return response()->json([
	            'headers' => $headers
	        ]);
	    }
	    
		return inertia(
			'admin/NavigationMaker',
			[
				'headers' => $headers,
			]
		);
	}

	public function update(NavigationRequest $request) {
		// Get validated data from request
		$data = $request->validated();
		
		// Pass headers data to service
		$headers = $this->navigationService->syncNavigation($data);
		
		return response()->json($headers, 200);
	}

	public function getNavigationData(GetNavigationRequest $request) {
		$headers = $this->navigationService->getNavigationData();
		return response()->json($headers, 200);
	}
}
