<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('shop_settings', function (Blueprint $table) {
            $table->id();
            $table->string('currency', 3)->default('LEV');
            $table->string('mapbox_api_key')->nullable();
            $table->string('sendgrid_api_key')->nullable();
            $table->string('shop_name')->default('My Shop')->nullable();
            $table->string('shop_logo')->nullable();
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('shop_settings');
    }
};
