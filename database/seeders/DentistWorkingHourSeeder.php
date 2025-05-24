<?php

namespace Database\Seeders;

use App\Services\DentistWorkingHourService;
use Illuminate\Database\Seeder;

class DentistWorkingHourSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default working hours for all dentists
        DentistWorkingHourService::createDefaultWorkingHoursForAllDentists();
    }


}
