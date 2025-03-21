<?php

namespace Database\Factories;

use App\Models\DentalService;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'];
        
        // Create appointment dates between now and 3 months in the future
        $appointmentDate = fake()->dateTimeBetween('now', '+3 months');
        
        // Business hours from 9am to 5pm
        $hour = fake()->numberBetween(9, 16);
        $minute = fake()->randomElement([0, 15, 30, 45]);
        $appointmentTime = clone $appointmentDate;
        $appointmentTime->setTime($hour, $minute);
        
        return [
            'patient_id' => Patient::factory(),
            'dentist_id' => User::factory()->dentist(),
            'dental_service_id' => DentalService::factory(),
            'appointment_datetime' => $appointmentTime,
            'duration_minutes' => fake()->randomElement([30, 45, 60, 90]),
            'status' => fake()->randomElement($statuses),
            'notes' => fake()->optional(0.7)->sentence(),
            'treatment_notes' => fake()->optional(0.5)->paragraph(),
            'cost' => fake()->randomFloat(2, 50, 2000),
            'cancellation_reason' => function (array $attributes) {
                return $attributes['status'] === 'cancelled' ? fake()->sentence() : null;
            },
        ];
    }
    
    /**
     * Indicate that the appointment is scheduled.
     */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'scheduled',
        ]);
    }
    
    /**
     * Indicate that the appointment is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
        ]);
    }
    
    /**
     * Indicate that the appointment is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'treatment_notes' => fake()->paragraph(),
        ]);
    }
    
    /**
     * Indicate that the appointment is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'cancellation_reason' => fake()->sentence(),
        ]);
    }
}
