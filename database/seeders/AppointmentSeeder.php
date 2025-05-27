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
        
        // Reset all patient balances to zero before we start
        foreach ($patients as $patient) {
            $patient->balance = 0;
            $patient->save();
        }
        
        // Create appointments for each status
        $this->createPastAppointments($patients, $dentists, $services);
        $this->createTodayAppointments($patients, $dentists, $services);
        $this->createUpcomingAppointments($patients, $dentists, $services);
    }
    
    /**
     * Create past appointments (completed, cancelled)
     */
    private function createPastAppointments($patients, $dentists, $services): void
    {
        // Create 10 completed appointments in the past month
        foreach (range(1, 10) as $index) {
            $patient = $patients->random();
            $service = $services->random();
            
            $appointment = Appointment::factory()
                ->completed()
                ->create([
                    'patient_id' => $patient->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $service->id,
                    'appointment_datetime' => Carbon::now()->subDays(rand(1, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                    'cost' => $service->price, // Set cost from dental service
                ]);
                
            // If not paid, adjust patient balance (add as debt)
            if (!$appointment->is_paid) {
                $patient->balance -= $service->price; // Negative balance means debt
                $patient->save();
            }
        }
        
        // Create 5 cancelled appointments in the past month
        foreach (range(1, 5) as $index) {
            $service = $services->random();
            
            // For cancelled appointments we don't need to update balance
            Appointment::factory()
                ->cancelled()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $service->id,
                    'appointment_datetime' => Carbon::now()->subDays(rand(1, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                    'cost' => $service->price, // Set cost from dental service
                    'is_paid' => false, // Cancelled appointments are never paid
                ]);
        }
        
        // Create 3 additional cancelled appointments in the past month (former no_shows)
        foreach (range(1, 3) as $index) {
            $service = $services->random();
            
            Appointment::factory()
                ->cancelled()
                ->create([
                    'patient_id' => $patients->random()->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $service->id,
                    'appointment_datetime' => Carbon::now()->subDays(rand(1, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                    'cost' => $service->price, // Set cost from dental service
                    'is_paid' => false, // No-shows are never paid
                    'cancellation_reason' => 'Patient did not show up',
                ]);
        }
    }
    
    /**
     * Create appointments for today (pending, confirmed)
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
            $patient = $patients->random();
            $service = $services->random();
            
            $appointment = Appointment::factory()
                ->confirmed()
                ->create([
                    'patient_id' => $patient->id,
                    'dentist_id' => $dentist->id,
                    'dental_service_id' => $service->id,
                    'appointment_datetime' => Carbon::today()->setTime($morningHour, $morningMinute),
                    'cost' => $service->price, // Set cost from dental service
                ]);
                
            // Confirmed appointments have no balance adjustment yet
            // They'll affect balance when completed or canceled
            
            // Afternoon appointment
            $afternoonHour = 14;
            $afternoonMinute = [0, 15, 30, 45][rand(0, 3)];
            $patient = $patients->random();
            $service = $services->random();
            
            $appointment = Appointment::factory()
                ->confirmed()
                ->create([
                    'patient_id' => $patient->id,
                    'dentist_id' => $dentist->id,
                    'dental_service_id' => $service->id,
                    'appointment_datetime' => Carbon::today()->setTime($afternoonHour, $afternoonMinute),
                    'cost' => $service->price, // Set cost from dental service
                ]);
                
            // Confirmed appointments have no balance adjustment yet
            // They'll affect balance when completed or canceled
        }
    }
    
    /**
     * Create upcoming appointments (pending, confirmed)
     */
    private function createUpcomingAppointments($patients, $dentists, $services): void
    {
        // Create 8 pending appointments in the next two weeks
        foreach (range(1, 8) as $index) {
            $patient = $patients->random();
            $service = $services->random();
            
            Appointment::factory()
                ->pending()
                ->create([
                    'patient_id' => $patient->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $service->id,
                    'appointment_datetime' => Carbon::now()->addDays(rand(1, 14))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                    'cost' => $service->price, // Set cost from dental service
                    'is_paid' => false, // Pending appointments are not paid yet
                ]);
        }
        
        // Create 6 confirmed appointments in the next month
        foreach (range(1, 6) as $index) {
            $patient = $patients->random();
            $service = $services->random();
            
            $appointment = Appointment::factory()
                ->confirmed()
                ->create([
                    'patient_id' => $patient->id,
                    'dentist_id' => $dentists->random()->id,
                    'dental_service_id' => $service->id,
                    'appointment_datetime' => Carbon::now()->addDays(rand(3, 30))->setTime(rand(9, 16), [0, 15, 30, 45][rand(0, 3)]),
                    'cost' => $service->price, // Set cost from dental service
                ]);
        }
    }
}
