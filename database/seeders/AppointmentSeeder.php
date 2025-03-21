<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\DentistAvailability;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing data
        $patients = Patient::all();
        $dentists = User::where('role', 'dentist')->get();
        $services = DentalService::where('is_active', true)->get();
        
        if ($patients->isEmpty() || $dentists->isEmpty() || $services->isEmpty()) {
            return;
        }
        
        // Create appointments for each status
        $this->createPastAppointments($patients, $dentists, $services);
        $this->createUpcomingAppointments($patients, $dentists, $services);
    }
    
    /**
     * Create past appointments (completed, cancelled, no_show)
     */
    private function createPastAppointments($patients, $dentists, $services): void
    {
        // Create 10 completed appointments in the past month
        foreach (range(1, 10) as $index) {
            Appointment::factory()
                ->completed()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $services->random()->id,
                    'appointment_datetime' => Carbon::now()->subDays(rand(1, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                ]);
        }
        
        // Create 5 cancelled appointments in the past month
        foreach (range(1, 5) as $index) {
            Appointment::factory()
                ->cancelled()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $services->random()->id,
                    'appointment_datetime' => Carbon::now()->subDays(rand(1, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                ]);
        }
        
        // Create 3 no_show appointments in the past month
        foreach (range(1, 3) as $index) {
            Appointment::factory()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $services->random()->id,
                    'appointment_datetime' => Carbon::now()->subDays(rand(1, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                    'status' => 'no_show',
                ]);
        }
    }
    
    /**
     * Create upcoming appointments (scheduled, confirmed)
     */
    private function createUpcomingAppointments($patients, $dentists, $services): void
    {
        // Create 8 scheduled (pending) appointments in the next two weeks
        foreach (range(1, 8) as $index) {
            Appointment::factory()
                ->scheduled()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $services->random()->id,
                    'appointment_datetime' => Carbon::now()->addDays(rand(1, 14))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                ]);
        }
        
        // Create 6 confirmed appointments in the next month
        foreach (range(1, 6) as $index) {
            Appointment::factory()
                ->confirmed()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $services->random()->id,
                    'appointment_datetime' => Carbon::now()->addDays(rand(3, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                ]);
        }
    }
}
