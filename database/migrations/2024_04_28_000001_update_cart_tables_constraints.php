<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // First drop the existing cart_items table if it exists
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');

        // Recreate carts table
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('session_id')->nullable()->index();
            $table->decimal('total', 10, 2)->default(0);
            $table->string('currency')->default('USD');
            $table->enum('status', ['active', 'abandoned', 'converted'])->default('active');
            $table->timestamp('last_activity')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');
        });

        // Recreate cart_items table with proper constraints
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->onDelete('cascade');
            $table->foreignId('subproduct_id')->constrained('subproducts')->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->unique(['cart_id', 'subproduct_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};
