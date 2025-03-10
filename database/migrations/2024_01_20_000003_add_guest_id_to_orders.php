<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('guest_id')->nullable()->after('user_id');
            $table->foreign('guest_id')->references('id')->on('guests')->onDelete('set null');
        });
    }

    public function down() {
        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropForeign(['guest_id']);
                $table->dropColumn('guest_id');
            });
        } else {
            // For SQLite, recreate the table without the guest_id column
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('guest_id');
            });
        }
    }
};
