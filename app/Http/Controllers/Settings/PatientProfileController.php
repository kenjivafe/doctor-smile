<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PatientProfileController extends Controller
{
    /**
     * Update the patient's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        // Validate the incoming request
        $validated = Validator::make($request->all(), [
            'phone_number' => ['required', 'string', 'max:20'],
            'date_of_birth' => ['required', 'date'],
            'gender' => ['required', 'string', 'in:male,female,other,prefer_not_to_say'],
            'address' => ['required', 'string', 'max:255'],
            'medical_history' => ['nullable', 'string'],
            'allergies' => ['nullable', 'string'],
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_phone' => ['required', 'string', 'max:20'],
        ])->validate();

        $user = Auth::user();

        // Check if the patient record exists, if not create one
        $patient = Patient::firstOrNew(['user_id' => $user->id]);
        
        // Update the patient record with the validated data
        $patient->phone_number = $validated['phone_number'];
        $patient->date_of_birth = $validated['date_of_birth'];
        $patient->gender = $validated['gender'];
        $patient->address = $validated['address'];
        $patient->medical_history = $validated['medical_history'];
        $patient->allergies = $validated['allergies'];
        $patient->emergency_contact_name = $validated['emergency_contact_name'];
        $patient->emergency_contact_phone = $validated['emergency_contact_phone'];
        
        // Save the patient record
        $patient->save();

        return to_route('profile.edit')->with('status', 'patient-profile-updated');
    }
}
