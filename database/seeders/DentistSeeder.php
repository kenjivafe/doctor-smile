<?php

namespace Database\Seeders;

use App\Models\Dentist;
use App\Models\User;
use Illuminate\Database\Seeder;

class DentistSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing dentist users
        $dentistUsers = User::where('role', 'dentist')->get();

        // Sample dentist details
        $dentistDetails = [
            'raymond@doctor-smile.com' => [
                'bio' => 'Experienced dentist specializing in cosmetic dentistry and restorative procedures.',
                'years_of_experience' => 12,
                'contact_number' => '555-123-4567',
                'address' => '123 Dental Plaza, Suite 101, Cityville',
            ],
            'sarah@doctor-smile.com' => [
                'bio' => 'Specializes in pediatric dentistry and dental hygiene. Gentle approach for nervous patients.',
                'years_of_experience' => 8,
                'contact_number' => '555-987-6543',
                'address' => '456 Smile Avenue, Suite 202, Townsburg',
            ],
            'michael@doctor-smile.com' => [
                'bio' => 'Expert in dental implants and reconstructive dentistry. Board certified in oral surgery.',
                'years_of_experience' => 15,
                'contact_number' => '555-456-7890',
                'address' => '789 Orthodontic Lane, Suite 303, Dentalville',
            ],
            'emily@doctor-smile.com' => [
                'bio' => 'Focuses on preventive care and gum disease treatment. Certified in advanced periodontics.',
                'years_of_experience' => 7,
                'contact_number' => '555-321-0987',
                'address' => '321 Floss Street, Suite 404, Brushtown',
            ],
        ];

        // Create dentist profiles for existing users
        foreach ($dentistUsers as $user) {
            // Skip if dentist profile already exists
            if (Dentist::where('user_id', $user->id)->exists()) {
                continue;
            }

            // Get details for this dentist or use defaults
            $details = $dentistDetails[$user->email] ?? [
                'bio' => 'Professional dentist with experience in general dentistry.',
                'years_of_experience' => 5,
                'contact_number' => '555-000-0000',
                'address' => 'Doctor Smile Dental Clinic',
            ];

            // Create dentist profile
            Dentist::create([
                'user_id' => $user->id,
                'bio' => $details['bio'],
                'years_of_experience' => $details['years_of_experience'],
                'contact_number' => $details['contact_number'],
                'address' => $details['address'],
            ]);
        }
    }
}
