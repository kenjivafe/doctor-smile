<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DentalService>
 */
class DentalServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = ['general', 'cosmetic', 'orthodontic', 'surgical', 'pediatric', 'preventive'];
        
        return [
            'name' => fake()->randomElement([
                'Dental Checkup', 'Teeth Cleaning', 'Teeth Whitening', 
                'Dental Filling', 'Root Canal Treatment', 'Dental Crown',
                'Dental Bridge', 'Dental Implant', 'Tooth Extraction',
                'Wisdom Tooth Removal', 'Gum Treatment', 'Dentures',
                'Dental Veneer', 'Braces', 'Invisalign',
                'Dental Sealant', 'Fluoride Treatment', 'Dental X-Ray'
            ]),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 50, 2000),
            'duration_minutes' => fake()->randomElement([30, 45, 60, 90, 120, 180]),
            'category' => fake()->randomElement($categories),
            'is_active' => fake()->boolean(80), // 80% chance of being active
            'image_path' => null,
        ];
    }
}
