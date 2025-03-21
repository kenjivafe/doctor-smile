<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@doctor-smile.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Create Dentists
        $dentists = [
            [
                'name' => 'Dr. Raymond Timothy R. Obispo',
                'email' => 'raymond@doctor-smile.com',
                'password' => Hash::make('password'),
                'role' => 'dentist',
            ],
            [
                'name' => 'Dr. Sarah Johnson',
                'email' => 'sarah@doctor-smile.com',
                'password' => Hash::make('password'),
                'role' => 'dentist',
            ],
            [
                'name' => 'Dr. Michael Chen',
                'email' => 'michael@doctor-smile.com',
                'password' => Hash::make('password'),
                'role' => 'dentist',
            ],
            [
                'name' => 'Dr. Emily Rodriguez',
                'email' => 'emily@doctor-smile.com',
                'password' => Hash::make('password'),
                'role' => 'dentist',
            ],
        ];

        foreach ($dentists as $dentist) {
            User::create($dentist);
        }
    }
}
