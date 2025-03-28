<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_address_info');
            $table->string('email');
            $table->string('phone');
            $table->timestamps();

            $table->foreign('id_address_info')->references('id')->on('address_infos')->onDelete('cascade');
        });
    }

    public function down() {
        Schema::dropIfExists('guests');
    }
};
