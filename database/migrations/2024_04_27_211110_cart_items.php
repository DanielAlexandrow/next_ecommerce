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

		Schema::create('cart_item', function (Blueprint $table) {
			$table->id();
			$table->unsignedBigInteger('cart_id');
			$table->unsignedBigInteger('subproduct_id');
			$table->timestamps();

			$table->foreign('cart_id')->references('id')->on('cart');
			$table->foreign('subproduct_id')->references('id')->on('subproducts');
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void
	{
		Schema::dropIfExists('cart_item');
	}
};
