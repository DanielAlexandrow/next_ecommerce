<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::dropIfExists('deals');
        
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('discount_amount');
            $table->string('discount_type')->check("discount_type in ('percentage', 'fixed')");
            $table->datetime('start_date');
            $table->datetime('end_date');
            $table->boolean('active')->default(true);
            $table->string('deal_type')->check("deal_type in ('product', 'category', 'brand', 'cart')");
            $table->text('conditions')->nullable();
            $table->text('metadata')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('deals');
    }
};