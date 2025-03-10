<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('navigation_item', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('order_num');
            $table->unsignedBigInteger('header_id');
            $table->foreign('header_id')->references('id')->on('headers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('navigation_item');
    }
};
