<?php

namespace Database\Seeders;

use App\Models\DentistAvailability;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DentistAvailabilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all dentist users
        $dentists = User::where('role', 'dentist')->get();

        if ($dentists->isEmpty()) {
            return;
        }

        // Set availability for each dentist for the next 4 weeks
        foreach ($dentists as $dentist) {
            // Create weekly recurring schedule for next 4 weeks
            // Monday to Friday, 9am to 5pm
            $this->createWeeklySchedule($dentist->id);

            // Add weekend availabilities (Saturday and Sunday)
            $this->createWeekendAvailabilities($dentist->id);
        }
    }

    /**
     * Create a weekly schedule for a dentist
     *
     * @param int $dentistId
     * @return void
     */
    private function createWeeklySchedule(int $dentistId): void
    {
        $startDate = Carbon::now()->startOfWeek(); // Monday
        $endDate = Carbon::now()->addMonths(3);

        // Monday to Friday
        for ($day = 0; $day < 5; $day++) {
            $date = $startDate->copy()->addDays($day);

            DentistAvailability::create([
                'dentist_id' => $dentistId,
                'date' => $date->format('Y-m-d'),
                'start_time' => '09:00:00',
                'end_time' => '12:00:00',
                'repeat_type' => 'weekly',
                'repeat_end_date' => $endDate->format('Y-m-d'),
                'is_active' => true,
                'notes' => 'Morning hours',
            ]);

            DentistAvailability::create([
                'dentist_id' => $dentistId,
                'date' => $date->format('Y-m-d'),
                'start_time' => '13:00:00', // 1 hour lunch break
                'end_time' => '16:00:00',
                'repeat_type' => 'weekly',
                'repeat_end_date' => $endDate->format('Y-m-d'),
                'is_active' => true,
                'notes' => 'Afternoon hours',
            ]);
        }
    }
    
    /**
     * Create weekend availabilities for the next few weekends
     *
     * @param int $dentistId
     * @return void
     */
    private function createWeekendAvailabilities(int $dentistId): void
    {
        $startDate = Carbon::now()->startOfWeek(); // Monday
        
        // Add some weekend availabilities for the next 4 weekends
        for ($weekend = 0; $weekend < 4; $weekend++) {
            // Saturday
            if (rand(0, 100) > 40) { // 60% chance of working Saturday
                $saturdayDate = $startDate->copy()->addDays(5)->addWeeks($weekend);
                DentistAvailability::create([
                    'dentist_id' => $dentistId,
                    'date' => $saturdayDate->format('Y-m-d'),
                    'start_time' => '09:00:00',
                    'end_time' => '13:00:00',
                    'repeat_type' => 'none',
                    'repeat_end_date' => null,
                    'is_active' => true,
                    'notes' => 'Saturday morning hours',
                ]);
            }
            
            // Sunday
            if (rand(0, 100) > 70) { // 30% chance of working Sunday
                $sundayDate = $startDate->copy()->addDays(6)->addWeeks($weekend);
                DentistAvailability::create([
                    'dentist_id' => $dentistId,
                    'date' => $sundayDate->format('Y-m-d'),
                    'start_time' => '10:00:00',
                    'end_time' => '13:00:00',
                    'repeat_type' => 'none',
                    'repeat_end_date' => null,
                    'is_active' => true,
                    'notes' => 'Sunday limited hours',
                ]);
            }
        }
    }
}
