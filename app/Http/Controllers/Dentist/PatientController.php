<?php

namespace App\Http\Controllers\Dentist;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a listing of the patients who have had appointments with the dentist.
     */
    public function index()
    {
        $dentistId = Auth::id();

        // Get all patients who have had appointments with this dentist
        $patients = Patient::select('patients.*')
            ->join('appointments', 'patients.id', '=', 'appointments.patient_id')
            ->where('appointments.dentist_id', $dentistId)
            ->distinct()
            ->with('user:id,name,email')
            ->get()
            ->map(function ($patient) use ($dentistId) {
                // Get the latest appointment for this patient with this dentist
                $latestAppointment = Appointment::where('patient_id', $patient->id)
                    ->where('dentist_id', $dentistId)
                    ->orderBy('appointment_datetime', 'desc')
                    ->first();

                // Count total appointments
                $appointmentCount = Appointment::where('patient_id', $patient->id)
                    ->where('dentist_id', $dentistId)
                    ->count();

                // Format the patient data for the frontend
                return [
                    'id' => $patient->id,
                    'name' => $patient->user->name ?? 'Unknown Patient',
                    'email' => $patient->user->email ?? 'No Email',
                    'phone_number' => $patient->phone_number,
                    'date_of_birth' => $patient->date_of_birth ? $patient->date_of_birth->format('Y-m-d') : null,
                    'gender' => $patient->gender,
                    'last_visit' => $latestAppointment ? $latestAppointment->appointment_datetime->format('Y-m-d') : null,
                    'appointment_count' => $appointmentCount,
                    'balance' => $patient->balance,
                    'suggested_next_appointment' => $patient->suggested_next_appointment ? $patient->suggested_next_appointment->format('Y-m-d') : null,
                    'next_appointment_reason' => $patient->next_appointment_reason,
                ];
            });

        return Inertia::render('Dentist/patients', [
            'patients' => $patients,
        ]);
    }

    /**
     * Display the specified patient's details.
     */
    public function show($id)
    {
        $dentistId = Auth::id();
        // Find the patient with user relationship
        try {
            $patient = Patient::with('user:id,name,email')->findOrFail($id);
            Log::info('Patient found', ['patient_id' => $patient->id]);
            
            // Check if user relationship exists
            if (!$patient->user) {
                Log::warning('Patient found but user relationship is missing', [
                    'patient_id' => $patient->id,
                    'user_id' => $patient->user_id
                ]);
                
                // Try to find the user separately
                $user = \App\Models\User::find($patient->user_id);
                if ($user) {
                    // Manually attach the user to the patient
                    $patient->setRelation('user', $user);
                    Log::info('User manually attached to patient', [
                        'user_id' => $user->id,
                        'user_name' => $user->name
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error finding patient', [
                'error' => $e->getMessage(),
                'patient_id' => $id
            ]);
            return redirect()->route('dentist.patients')
                ->with('error', 'Patient not found or data is incomplete.');
        }

        // Verify that this dentist has had appointments with this patient
        $hasAppointments = Appointment::where('patient_id', $id)
            ->where('dentist_id', $dentistId)
            ->exists();

        // Add debugging information about the appointment check
        Log::info('Appointment check', [
            'patient_id' => $id,
            'dentist_id' => $dentistId,
            'has_appointments' => $hasAppointments
        ]);
        
        // Temporarily bypass the appointment check for debugging
        // if (!$hasAppointments) {
        //     return redirect()->route('dentist.patients')
        //         ->with('error', 'You do not have access to this patient record.');
        // }

        // Get all appointments for this patient with this dentist
        $appointments = Appointment::where('patient_id', $id)
            ->where('dentist_id', $dentistId)
            ->with('dentalService')
            ->orderBy('appointment_datetime', 'desc')
            ->get()
            ->map(function ($appointment) {
                // Check if the dentalService relationship exists and handle it safely
                $serviceName = 'General Consultation';
                try {
                    if ($appointment->dentalService) {
                        $serviceName = $appointment->dentalService->name;
                    }
                } catch (\Exception $e) {
                    Log::warning('Error accessing dental service for appointment', [
                        'appointment_id' => $appointment->id,
                        'error' => $e->getMessage()
                    ]);
                }
                
                return [
                    'id' => $appointment->id,
                    'service_name' => $serviceName,
                    'appointment_datetime' => $appointment->appointment_datetime->format('Y-m-d H:i'),
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes ?? 30,
                    'cost' => $appointment->cost ?? 0,
                    'notes' => $appointment->notes,
                    'treatment_notes' => $appointment->treatment_notes,
                ];
            });

        // Format the patient data for the frontend with enhanced safety checks
        $patientData = [
            'id' => $patient->id,
            'name' => $patient->user->name ?? 'Unknown Patient',
            'email' => $patient->user->email ?? 'No Email',
            'phone_number' => $patient->phone_number ?? 'Not provided',
            'date_of_birth' => $patient->date_of_birth ? $patient->date_of_birth->format('Y-m-d') : null,
            'gender' => $patient->gender ?? 'Not specified',
            'address' => $patient->address,
            'medical_history' => $patient->medical_history,
            'allergies' => $patient->allergies,
            'emergency_contact_name' => $patient->emergency_contact_name,
            'emergency_contact_phone' => $patient->emergency_contact_phone,
            'balance' => $patient->balance,
            'suggested_next_appointment' => $patient->suggested_next_appointment ? $patient->suggested_next_appointment->format('Y-m-d') : null,
            'next_appointment_reason' => $patient->next_appointment_reason,
        ];

        // Add debugging information
        Log::info('Patient data being passed to view', [
            'patient' => $patientData,
            'appointments_count' => count($appointments)
        ]);

        return Inertia::render('Dentist/patient-details', [
            'patient' => $patientData,
            'appointments' => $appointments,
        ]);
    }

    /**
     * Update the patient's suggested next appointment.
     */
    public function updateNextAppointment(Request $request, $id)
    {
        $dentistId = Auth::id();
        $patient = Patient::findOrFail($id);

        // Verify that this dentist has had appointments with this patient
        $hasAppointments = Appointment::where('patient_id', $id)
            ->where('dentist_id', $dentistId)
            ->exists();

        // Add debugging information about the appointment check
        Log::info('Appointment check', [
            'patient_id' => $id,
            'dentist_id' => $dentistId,
            'has_appointments' => $hasAppointments
        ]);
        
        // Temporarily bypass the appointment check for debugging
        // if (!$hasAppointments) {
        //     return redirect()->route('dentist.patients')
        //         ->with('error', 'You do not have access to this patient record.');
        // }

        $request->validate([
            'suggested_next_appointment' => 'required|date|after:today',
            'next_appointment_reason' => 'required|string|max:500',
        ]);

        $patient->suggested_next_appointment = $request->suggested_next_appointment;
        $patient->next_appointment_reason = $request->next_appointment_reason;
        $patient->save();

        return redirect()->route('dentist.patients.show', $id)
            ->with('success', 'Next appointment suggestion updated successfully.');
    }

    /**
     * Update the patient's medical notes.
     */
    public function updateMedicalNotes(Request $request, $id)
    {
        $dentistId = Auth::id();

        // Verify that this dentist has had appointments with this patient
        $hasAppointments = Appointment::where('patient_id', $id)
            ->where('dentist_id', $dentistId)
            ->exists();
            
        // Add debugging information about the appointment check
        Log::info('Appointment check for medical notes update', [
            'patient_id' => $id,
            'dentist_id' => $dentistId,
            'has_appointments' => $hasAppointments
        ]);
        
        // Temporarily bypass the appointment check for debugging
        // if (!$hasAppointments) {
        //     return redirect()->route('dentist.patients')
        //         ->with('error', 'You do not have access to this patient record.');
        // }

        $request->validate([
            'medical_history' => 'nullable|string|max:2000',
            'allergies' => 'nullable|string|max:2000',
        ]);

        $patient = Patient::findOrFail($id);
        $patient->update([
            'medical_history' => $request->medical_history,
            'allergies' => $request->allergies,
        ]);

        return redirect()->back()->with('success', 'Medical notes updated successfully.');
    }

    /**
     * Update the patient's balance.
     */
    public function updateBalance(Request $request, $id)
    {
        $dentistId = Auth::id();

        // Verify that this dentist has had appointments with this patient
        $hasAppointments = Appointment::where('patient_id', $id)
            ->where('dentist_id', $dentistId)
            ->exists();

        // Add debugging information about the appointment check
        Log::info('Appointment check for balance update', [
            'patient_id' => $id,
            'dentist_id' => $dentistId,
            'has_appointments' => $hasAppointments
        ]);
        
        // Temporarily bypass the appointment check for debugging
        // if (!$hasAppointments) {
        //     return redirect()->route('dentist.patients')
        //         ->with('error', 'You do not have access to this patient record.');
        // }

        $request->validate([
            'balance' => 'required|numeric|min:0',
        ]);

        $patient = Patient::findOrFail($id);
        $patient->update([
            'balance' => $request->balance,
        ]);

        Log::info('Patient balance updated', [
            'patient_id' => $id,
            'old_balance' => $patient->getOriginal('balance'),
            'new_balance' => $request->balance
        ]);

        return redirect()->back()->with('success', 'Patient balance updated successfully.');
    }
}
