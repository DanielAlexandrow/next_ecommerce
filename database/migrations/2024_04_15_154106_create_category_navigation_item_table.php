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
		Schema::create('category_navigation_item', function (Blueprint $table) {
			$table->id();
			$table->text('description')->nullable();
			$table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
			$table->foreignId('navigation_item_id')->constrained('navigation_item')->onDelete('cascade');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('category_navigation_item');
	}
};
