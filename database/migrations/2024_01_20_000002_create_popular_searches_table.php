<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('popular_searches', function (Blueprint $table) {
            $table->id();
            $table->string('search_term')->unique();
            $table->unsignedInteger('count')->default(1);
            $table->timestamps();

            $table->index('count');
        });
    }

    public function down() {
        Schema::dropIfExists('popular_searches');
    }
};
