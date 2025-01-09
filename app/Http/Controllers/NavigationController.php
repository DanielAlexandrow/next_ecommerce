<?php

namespace App\Http\Controllers;

use App\Http\Requests\NavigationRequest;
use App\Http\Requests\GetNavigationRequest;
use App\Interfaces\NavigationServiceInterface;

class NavigationController extends Controller {
	protected $navigationService;

	public function __construct(NavigationServiceInterface $navigationService) {
		$this->navigationService = $navigationService;
	}

	public function index() {
		return inertia(
			'admin/NavigationMaker',
			[
				'headers' => $this->navigationService->getNavigationData(),
			]
		);
	}

	public function update(NavigationRequest $request) {
		$headers = $this->navigationService->syncNavigation($request->all());
		return response()->json($headers, 200);
	}

	public function getNavigationData(GetNavigationRequest $request) {
		$headers = $this->navigationService->getNavigationData();
		return response()->json($headers, 200);
	}
}
