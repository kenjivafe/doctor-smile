<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\PatientSeeder;
use Database\Seeders\DentistSeeder;
use Database\Seeders\DentistAvailabilitySeeder;
use Database\Seeders\DentalServiceSeeder;
use Database\Seeders\AppointmentSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,            // Run first: creates base users including dentists
            DentistSeeder::class,         // Run second: creates dentist profiles for dentist users
            PatientSeeder::class,         // Run third: creates patients (depends on users)
            DentistAvailabilitySeeder::class, // Run fourth: creates dentist availabilities (depends on dentist users)
            DentalServiceSeeder::class,   // Run fifth: creates dental services
            AppointmentSeeder::class,     // Run last: creates appointments (depends on patients, dentists, and services)
        ]);
    }
}
