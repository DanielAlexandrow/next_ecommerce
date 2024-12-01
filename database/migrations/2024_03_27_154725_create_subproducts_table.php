<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSubproductsTable extends Migration
{

    public function up()
    {
        Schema::create('subproducts', function (Blueprint $table) {
            $table->id(); 
            $table->string('name');
            $table->decimal('price', 8, 2);
            $table->unsignedBigInteger('product_id'); 
			$table->boolean('available')->default(true);
            $table->foreign('product_id')->references('id')->on('products');  
		});
    }

    public function down()
    {
        Schema::dropIfExists('subproducts');
    }
}
