<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PatientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some predefined patients for testing
        $predefinedPatients = [
            [
                'user' => [
                    'name' => 'John Doe',
                    'email' => 'john.doe@example.com',
                    'password' => Hash::make('password'),
                    'role' => 'patient',
                ],
                'patient' => [
                    'phone_number' => '09175123456',
                    'date_of_birth' => '1985-06-15',
                    'gender' => 'male',
                    'address' => '123 Main St, Anytown, PH',
                    'medical_history' => 'No significant medical history',
                    'allergies' => 'Penicillin',
                    'emergency_contact_name' => 'Jane Doe',
                    'emergency_contact_phone' => '09173216543',
                ],
            ],
            [
                'user' => [
                    'name' => 'Maria Garcia',
                    'email' => 'maria.garcia@example.com',
                    'password' => Hash::make('password'),
                    'role' => 'patient',
                ],
                'patient' => [
                    'phone_number' => '09182345678',
                    'date_of_birth' => '1990-12-10',
                    'gender' => 'female',
                    'address' => '456 Oak Ave, Somewhere, PH',
                    'medical_history' => 'Asthma, Controlled with inhaler',
                    'allergies' => 'None',
                    'emergency_contact_name' => 'Carlos Garcia',
                    'emergency_contact_phone' => '+639178765432',
                ],
            ],
        ];

        // Create the predefined patients
        foreach ($predefinedPatients as $predefinedPatient) {
            $user = User::create($predefinedPatient['user']);
            
            $patientData = $predefinedPatient['patient'];
            $patientData['user_id'] = $user->id;
            
            Patient::create($patientData);
        }

        // Create random patients
        Patient::factory()->count(15)->create();
    }
}
