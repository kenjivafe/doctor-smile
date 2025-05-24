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
        Schema::create('dentist_working_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dentist_id')->constrained('users')->onDelete('cascade');
            $table->tinyInteger('day_of_week'); // 0 = Sunday, 1 = Monday, etc.
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dentist_working_hours');
    }
};
