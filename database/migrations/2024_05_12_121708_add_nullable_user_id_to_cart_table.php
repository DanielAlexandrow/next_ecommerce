<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNullableUserIdToCartTable extends Migration
{
	public function up()
	{
		Schema::table('cart', function (Blueprint $table) {
			$table->unsignedBigInteger('user_id')->nullable()->change();
		});
	}

	public function down()
	{
		Schema::table('cart', function (Blueprint $table) {
			$table->unsignedBigInteger('user_id')->nullable(false)->change();
		});
	}
}
