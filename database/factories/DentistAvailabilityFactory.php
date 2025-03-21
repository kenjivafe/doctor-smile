<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DentistAvailability>
 */
class DentistAvailabilityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $date = fake()->dateTimeBetween('now', '+30 days');
        
        // Business hours from 9am to 6pm
        $startHour = fake()->numberBetween(9, 16);
        $endHour = $startHour + fake()->numberBetween(1, 3);
        $endHour = min($endHour, 18); // Ensure it doesn't go past 6pm
        
        $repeatTypes = ['none', 'daily', 'weekly', 'monthly'];
        $repeatType = fake()->randomElement($repeatTypes);
        
        $repeatEndDate = null;
        if ($repeatType !== 'none') {
            $repeatEndDate = (clone $date)->modify('+3 months');
        }
        
        return [
            'dentist_id' => User::factory()->dentist(),
            'date' => $date->format('Y-m-d'),
            'start_time' => sprintf('%02d:00:00', $startHour),
            'end_time' => sprintf('%02d:00:00', $endHour),
            'repeat_type' => $repeatType,
            'repeat_end_date' => $repeatEndDate ? $repeatEndDate->format('Y-m-d') : null,
            'is_active' => true,
            'notes' => fake()->optional(0.3)->sentence(),
        ];
    }
    
    /**
     * Indicate that this is a one-time availability.
     */
    public function oneTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'repeat_type' => 'none',
            'repeat_end_date' => null,
        ]);
    }
    
    /**
     * Indicate that this availability repeats weekly.
     */
    public function weekly(): static
    {
        $date = fake()->dateTimeBetween('now', '+7 days');
        $repeatEndDate = (clone $date)->modify('+3 months');
        
        return $this->state(fn (array $attributes) => [
            'repeat_type' => 'weekly',
            'repeat_end_date' => $repeatEndDate->format('Y-m-d'),
        ]);
    }
}
