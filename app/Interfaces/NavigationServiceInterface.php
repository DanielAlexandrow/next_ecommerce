<?php

namespace App\Interfaces;

use App\Models\Header;

interface NavigationServiceInterface
{
	public function getNavigationData(): array;

	public function syncNavigation(array $headersData);

	public function updateHeader(array $headersData): Header;
}
