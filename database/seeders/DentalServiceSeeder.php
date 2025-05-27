<?php

namespace Database\Seeders;

use App\Models\DentalService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DentalServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Predefined dental services with realistic data
        $services = [
            [
                'name' => 'Dental Checkup',
                'description' => 'A thorough examination of your teeth, gums, and mouth to detect any potential issues.',
                'price' => 100.00,
                'duration_minutes' => 30,
                'category' => 'preventive',
                'is_active' => true,
            ],
            [
                'name' => 'Teeth Cleaning',
                'description' => 'Professional cleaning to remove plaque and tartar buildup that cannot be removed by regular brushing and flossing.',
                'price' => 100.00,
                'duration_minutes' => 45,
                'category' => 'preventive',
                'is_active' => true,
            ],
            [
                'name' => 'Teeth Whitening',
                'description' => 'Professional teeth whitening treatment to remove stains and discoloration for a brighter smile.',
                'price' => 300.00,
                'duration_minutes' => 60,
                'category' => 'cosmetic',
                'is_active' => true,
            ],
            [
                'name' => 'Dental Filling',
                'description' => 'Procedure to restore damaged or decayed teeth using filling materials to repair the tooth\'s structure.',
                'price' => 200.00,
                'duration_minutes' => 45,
                'category' => 'general',
                'is_active' => true,
            ],
            [
                'name' => 'Root Canal Treatment',
                'description' => 'Procedure to treat infection at the center of a tooth by removing the infected pulp and cleaning the canals.',
                'price' => 800.00,
                'duration_minutes' => 90,
                'category' => 'general',
                'is_active' => true,
            ],
            [
                'name' => 'Dental Crown',
                'description' => 'A cap placed over a damaged tooth to restore its shape, size, strength, and appearance.',
                'price' => 1000.00,
                'duration_minutes' => 60,
                'category' => 'general',
                'is_active' => true,
            ],
            [
                'name' => 'Dental Implant',
                'description' => 'A surgical procedure to replace missing teeth with artificial tooth roots that provide a permanent base for fixed replacement teeth.',
                'price' => 1800.00,
                'duration_minutes' => 120,
                'category' => 'surgical',
                'is_active' => true,
            ],
            [
                'name' => 'Braces',
                'description' => 'Orthodontic treatment to correct teeth alignment and bite issues using metal brackets and wires.',
                'price' => 3500.00,
                'duration_minutes' => 60,
                'category' => 'orthodontic',
                'is_active' => true,
            ],
            [
                'name' => 'Invisalign',
                'description' => 'Clear aligner treatment for straightening teeth without traditional metal braces.',
                'price' => 4500.00,
                'duration_minutes' => 45,
                'category' => 'orthodontic',
                'is_active' => true,
            ],
            [
                'name' => 'Wisdom Tooth Extraction',
                'description' => 'Surgical procedure to remove one or more wisdom teeth that are causing problems or are likely to cause problems in the future.',
                'price' => 400.00,
                'duration_minutes' => 60,
                'category' => 'surgical',
                'is_active' => true,
            ],
        ];

        // Create each predefined service
        foreach ($services as $service) {
            DentalService::create($service);
        }

        // Create additional random services
        DentalService::factory()->count(5)->create();
    }
}
