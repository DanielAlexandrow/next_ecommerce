<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('cart', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->string('session_id')->nullable()->index();
            $table->decimal('total', 10, 2)->default(0);
            $table->string('currency')->default('USD');
            $table->enum('status', ['active', 'abandoned', 'converted'])->default('active')->index();
            $table->timestamp('last_activity')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'last_activity']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('cart');
    }
};
