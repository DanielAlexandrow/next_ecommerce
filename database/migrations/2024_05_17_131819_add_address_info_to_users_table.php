<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up() {
		Schema::table('users', function (Blueprint $table) {
			$table->unsignedBigInteger('id_address_info')->nullable();
			$table->foreign('id_address_info')->references('id')->on('address_infos')->onDelete('set null');
			$table->unsignedBigInteger('user_id')->nullable();
			$table->unsignedBigInteger('guest_id')->nullable();
			$table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
			$table->foreign('guest_id')->references('id')->on('guests')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::table('users', function (Blueprint $table) {
			//
		});
	}
};
