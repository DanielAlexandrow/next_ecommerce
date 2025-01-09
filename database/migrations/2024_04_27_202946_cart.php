<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 * Creates the carts table with improved structure and indexes
	 */
	public function up(): void {
		Schema::create('carts', function (Blueprint $table) {
			$table->id();
			$table->unsignedBigInteger('user_id')->nullable();
			$table->string('session_id')->nullable()->index(); // For guest carts
			$table->decimal('total', 10, 2)->default(0);
			$table->string('currency')->default('USD');
			$table->enum('status', ['active', 'abandoned', 'converted'])->default('active')->index();
			$table->timestamp('last_activity')->useCurrent();
			$table->timestamps();
			$table->softDeletes(); // For cart recovery

			// Improved foreign key with index
			$table->foreign('user_id')
				->references('id')
				->on('users')
				->onDelete('cascade');

			// Compound index for queries
			$table->index(['status', 'last_activity']);
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::dropIfExists('carts');
	}
};
