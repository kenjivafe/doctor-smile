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
        $this->createTodayAppointments($patients, $dentists, $services);
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
     * Create appointments for today (scheduled, confirmed)
     */
    private function createTodayAppointments($patients, $dentists, $services): void
    {
        // Current hour in 24-hour format
        $currentHour = Carbon::now()->hour;
        
        // Calculate remaining business hours for today (assume business hours are 9-17)
        $startHour = max($currentHour + 1, 9); // Start at least 1 hour from now, but not before 9 AM
        $endHour = 17; // End of business day
        
        if ($startHour >= $endHour) {
            // If it's already past business hours, create appointments for earlier today (as if they were upcoming)
            $hoursArray = range(9, 16);
        } else {
            // Create appointments in the remaining business hours
            $hoursArray = range($startHour, 16);
        }
        
        // Create 2 confirmed appointments for today for each dentist
        foreach ($dentists as $dentist) {
            // Skip if no more available hours
            if (count($hoursArray) < 1) break;
            
            // Morning appointment
            $morningHour = 9;
            $morningMinute = [0, 15, 30, 45][rand(0, 3)];
            
            Appointment::factory()
                ->confirmed()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentist->id,
                    'dental_service_id' => $services->random()->id,
                    'appointment_datetime' => Carbon::today()->setTime($morningHour, $morningMinute),
                ]);
            
            // Afternoon appointment
            $afternoonHour = 14;
            $afternoonMinute = [0, 15, 30, 45][rand(0, 3)];
            
            Appointment::factory()
                ->confirmed()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentist->id,
                    'dental_service_id' => $services->random()->id,
                    'appointment_datetime' => Carbon::today()->setTime($afternoonHour, $afternoonMinute),
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
