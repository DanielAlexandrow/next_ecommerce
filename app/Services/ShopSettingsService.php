<?php

namespace App\Services;

use App\Models\ShopSettings;
use Illuminate\Support\Facades\Storage;

class ShopSettingsService {
    public function getSettings() {
        return ShopSettings::first() ?? new ShopSettings();
    }

    public function updateSettings(array $data) {
        $settings = $this->getSettings();


        $settings->fill($data);
        $settings->save();

        return $settings;
    }
}
