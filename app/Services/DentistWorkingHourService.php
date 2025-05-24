<?php

namespace App\Services;

use App\Models\DentistWorkingHour;
use App\Models\User;

class DentistWorkingHourService
{
    /**
     * Create default working hours for a dentist.
     * 
     * @param int $dentistId
     * @return void
     */
    public static function createDefaultWorkingHours(int $dentistId): void
    {
        // Default working hours (Monday to Saturday, 9AM to 5PM)
        $defaultWorkingHours = [
            [
                'day_of_week' => 1, // Monday
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
            ],
            [
                'day_of_week' => 2, // Tuesday
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
            ],
            [
                'day_of_week' => 3, // Wednesday
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
            ],
            [
                'day_of_week' => 4, // Thursday
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
            ],
            [
                'day_of_week' => 5, // Friday
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
            ],
            [
                'day_of_week' => 6, // Saturday
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'is_active' => true,
            ],
            // Sunday is closed by default (not included)
        ];

        // Create the working hours for the dentist
        foreach ($defaultWorkingHours as $workingHour) {
            DentistWorkingHour::updateOrCreate(
                [
                    'dentist_id' => $dentistId,
                    'day_of_week' => $workingHour['day_of_week'],
                ],
                [
                    'start_time' => $workingHour['start_time'],
                    'end_time' => $workingHour['end_time'],
                    'is_active' => $workingHour['is_active'],
                ]
            );
        }
    }

    /**
     * Create default working hours for all existing dentists.
     * 
     * @return void
     */
    public static function createDefaultWorkingHoursForAllDentists(): void
    {
        // Get all dentist users
        $dentists = User::where('role', 'dentist')->get();

        foreach ($dentists as $dentist) {
            self::createDefaultWorkingHours($dentist->id);
        }
    }
}
