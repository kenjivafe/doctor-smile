<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a form to create a new patient.
     */
    public function create()
    {
        return Inertia::render('Admin/patient-create', [
            // Any data needed for the create form
        ]);
    }

    /**
     * Store a newly created patient in the database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
        ]);

        // Use a transaction to ensure both user and patient are created or neither
        return DB::transaction(function () use ($request) {
            // Create user with patient role
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'patient',
            ]);

            // Create patient profile
            $patient = Patient::create([
                'user_id' => $user->id,
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
                'balance' => 0, // New patients start with zero balance
            ]);

            return redirect()->route('admin.patients')->with('success', 'Patient created successfully.');
        });
    }

    /**
     * Display the specified patient.
     */
    public function show($id)
    {
        $patient = User::where('role', 'patient')
            ->with(['patient' => function ($query) {
                $query->select('id', 'user_id', 'phone_number', 'date_of_birth', 'gender', 'address', 'balance');
            }])
            ->withCount([
                'appointments as total_appointments',
                'appointments as completed_appointments' => function ($query) {
                    $query->where('status', 'completed');
                },
                'appointments as cancelled_appointments' => function ($query) {
                    $query->where('status', 'cancelled');
                },
            ])
            ->findOrFail($id);

        // Calculate total spent on completed appointments
        $totalSpent = $patient->appointments()
            ->where('status', 'completed')
            ->join('dental_services', 'appointments.dental_service_id', '=', 'dental_services.id')
            ->sum('dental_services.price');

        // Get recent appointments for this patient
        $recentAppointments = $patient->appointments()
            ->with(['dentist', 'dentalService'])
            ->orderBy('appointment_datetime', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'dentist_name' => $appointment->dentist->name ?? 'Unknown',
                    'service_name' => $appointment->dentalService->name ?? 'Unknown',
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                    'cost' => $appointment->dentalService->price ?? 0,
                ];
            });

        return Inertia::render('Admin/patient-details', [
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'email' => $patient->email,
                'phone_number' => $patient->patient->phone_number ?? null,
                'address' => $patient->patient->address ?? null,
                'gender' => $patient->patient->gender ?? null,
                'date_of_birth' => $patient->patient->date_of_birth ? $patient->patient->date_of_birth->format('Y-m-d') : null,
                'balance' => (float) ($patient->patient->balance ?? 0),
                'totalAppointments' => (int) $patient->total_appointments,
                'completedAppointments' => (int) $patient->completed_appointments,
                'cancelledAppointments' => (int) $patient->cancelled_appointments,
                'totalSpent' => (float) $totalSpent,
            ],
            'recentAppointments' => $recentAppointments,
        ]);
    }

    /**
     * Show the form for editing the specified patient.
     */
    public function edit($id)
    {
        $patient = User::where('role', 'patient')
            ->with('patient')
            ->findOrFail($id);

        return Inertia::render('Admin/edit-patient', [
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'email' => $patient->email,
                'phone_number' => $patient->patient->phone_number ?? null,
                'address' => $patient->patient->address ?? null,
                'gender' => $patient->patient->gender ?? null,
                'date_of_birth' => $patient->patient->date_of_birth ? $patient->patient->date_of_birth->format('Y-m-d') : null,
                'balance' => (float) ($patient->patient->balance ?? 0),
            ],
        ]);
    }

    /**
     * Update the specified patient in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'balance' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($request, $id) {
            // Update user information
            $user = User::findOrFail($id);
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            // Update password if provided
            if ($request->filled('password')) {
                $request->validate([
                    'password' => ['required', 'confirmed', Password::defaults()],
                ]);
                
                $user->update([
                    'password' => Hash::make($request->password),
                ]);
            }

            // Update patient profile
            $user->patient()->update([
                'phone_number' => $request->phone_number,
                'address' => $request->address,
                'gender' => $request->gender,
                'date_of_birth' => $request->date_of_birth,
                'balance' => $request->balance ?? $user->patient->balance ?? 0,
            ]);

            return redirect()->route('admin.patient-details', $id)->with('success', 'Patient updated successfully.');
        });
    }

    /**
     * Remove the specified patient from storage.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Delete the user (which will cascade to delete the patient profile as well)
        $user->delete();

        return redirect()->route('admin.patients')->with('success', 'Patient deleted successfully.');
    }
}
