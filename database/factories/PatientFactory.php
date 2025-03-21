<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Handle next appointment suggestion
        $hasSuggestedAppointment = fake()->boolean(50);
        $suggestedNextAppointment = $hasSuggestedAppointment 
            ? fake()->dateTimeBetween('now', '+6 months')->format('Y-m-d') 
            : null;
        
        // Has appointment reason only if there's a suggested appointment
        $nextAppointmentReason = $hasSuggestedAppointment 
            ? fake()->sentence() 
            : null;
            
        return [
            'user_id' => User::factory()->patient(),
            'phone_number' => fake()->phoneNumber(),
            'date_of_birth' => fake()->dateTimeBetween('-80 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female', 'other']),
            'address' => fake()->address(),
            'medical_history' => fake()->optional(0.7)->paragraph(),
            'allergies' => fake()->optional(0.4)->sentence(),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => fake()->phoneNumber(),
            'balance' => fake()->randomFloat(2, 0, 1000),
            'suggested_next_appointment' => $suggestedNextAppointment,
            'next_appointment_reason' => $nextAppointmentReason,
        ];
    }
}
