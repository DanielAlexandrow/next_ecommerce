<?php

namespace App\Providers;

use App\Interfaces\ProductRepositoryInterface;
use App\Interfaces\ProductServiceInterface;
use App\Services\ProductService;
use App\Repositories\ProductRepository;
use App\Interfaces\NavigationServiceInterface;
use App\Services\NavigationService;
use App\Services\ShopSettingsService;
use App\Interfaces\CoordinateServiceInterface;
use App\Services\CoordinateService;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider {
	/**
	 * Register any application services.
	 */
	public function register(): void {
		$this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
		$this->app->bind(ProductServiceInterface::class, ProductService::class);
		$this->app->bind(NavigationServiceInterface::class, NavigationService::class);
		$this->app->bind(CoordinateServiceInterface::class, CoordinateService::class);
	}

	public function boot(): void {
		Inertia::share([
			'auth' => function () {
				$shopSettingsService = new ShopSettingsService();
				$shopSettings = $shopSettingsService->getSettings()->toArray();


				$authData = [
					'shop' => $shopSettings,
					'user' => null,
				];

				if (auth()->check()) {
					$authData['user'] = [
						'name' => auth()->user()->name,
						// Add more user details here as needed
					];
				}

				return $authData;
			},
		]);
	}
}
