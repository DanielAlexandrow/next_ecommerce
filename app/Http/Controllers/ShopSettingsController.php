<?php

namespace App\Http\Controllers;

use App\Services\ShopSettingsService;
use Illuminate\Http\Request;
use App\Http\Requests\ShopSettingsRequest;

class ShopSettingsController extends Controller {
    protected $shopSettingsService;

    public function __construct(ShopSettingsService $shopSettingsService) {
        $this->shopSettingsService = $shopSettingsService;
    }

    public function index() {
        $settings = $this->shopSettingsService->getSettings();
        return inertia('admin/ShopSettingsPage', compact('settings'));
    }

    public function update(ShopSettingsRequest $request) {
        $settings = $this->shopSettingsService->updateSettings($request->validated());
        return response()->json($settings);
    }
}
