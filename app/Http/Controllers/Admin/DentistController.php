<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dentist;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class DentistController extends Controller
{
    /**
     * Display a listing of dentists.
     */
    public function index()
    {
        // This functionality is already handled by AdminController::dentistManagement
        return redirect()->route('admin.dentists');
    }

    /**
     * Show the form for creating a new dentist.
     */
    public function create()
    {
        return Inertia::render('Admin/add-dentist');
    }

    /**
     * Store a newly created dentist in the database.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
            'years_of_experience' => 'nullable|integer|min:0',
        ]);

        // Use a transaction to ensure both user and dentist are created or neither
        return DB::transaction(function () use ($request) {
            // Create user with dentist role
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'dentist',
            ]);

            // Create dentist profile
            $dentist = Dentist::create([
                'user_id' => $user->id,
                'contact_number' => $request->contact_number,
                'address' => $request->address,
                'bio' => $request->bio,
                'years_of_experience' => $request->years_of_experience,
            ]);

            return redirect()->route('admin.dentists')->with('success', 'Dentist created successfully.');
        });
    }

    /**
     * Display the specified dentist.
     */
    public function show($id)
    {
        $dentist = User::where('role', 'dentist')
            ->with(['dentist' => function ($query) {
                $query->select('id', 'user_id', 'contact_number', 'address', 'bio', 'years_of_experience');
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

        // Get recent appointments for this dentist
        $recentAppointments = $dentist->appointments()
            ->with(['patient.user:id,name', 'dentalService:id,name,price'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient->user->name,
                    'service_name' => $appointment->dentalService->name,
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                    'cost' => $appointment->dentalService->price,
                ];
            });

        // Calculate revenue
        $revenue = $dentist->appointments()
            ->where('status', 'completed')
            ->join('dental_services', 'appointments.dental_service_id', '=', 'dental_services.id')
            ->sum('dental_services.price');

        // Prepare dentist data for the view
        $dentistData = [
            'id' => $dentist->id,
            'name' => $dentist->name,
            'email' => $dentist->email,
            'contact_number' => $dentist->dentist->contact_number ?? null,
            'address' => $dentist->dentist->address ?? null,
            'bio' => $dentist->dentist->bio ?? null,
            'years_of_experience' => $dentist->dentist->years_of_experience ?? null,
            'total_appointments' => $dentist->total_appointments,
            'completed_appointments' => $dentist->completed_appointments,
            'cancelled_appointments' => $dentist->cancelled_appointments,
            'revenue' => $revenue,
        ];

        return Inertia::render('Admin/dentist-details', [
            'dentist' => $dentistData,
            'recentAppointments' => $recentAppointments,
        ]);
    }

    /**
     * Show the form for editing the specified dentist.
     */
    public function edit($id)
    {
        $dentist = User::where('role', 'dentist')
            ->with('dentist')
            ->findOrFail($id);

        return Inertia::render('Admin/edit-dentist', [
            'dentist' => [
                'id' => $dentist->id,
                'name' => $dentist->name,
                'email' => $dentist->email,
                'contact_number' => $dentist->dentist->contact_number ?? null,
                'address' => $dentist->dentist->address ?? null,
                'bio' => $dentist->dentist->bio ?? null,
                'years_of_experience' => $dentist->dentist->years_of_experience ?? null,

            ],
        ]);
    }

    /**
     * Update the specified dentist in storage.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'contact_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'bio' => 'nullable|string|max:1000',
            'years_of_experience' => 'nullable|integer|min:0',
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

            // Update dentist profile
            $user->dentist()->update([
                'contact_number' => $request->contact_number,
                'address' => $request->address,
                'bio' => $request->bio,
                'years_of_experience' => $request->years_of_experience,
            ]);

            return redirect()->route('admin.dentists.show', $id)->with('success', 'Dentist updated successfully.');
        });
    }

    /**
     * Remove the specified dentist from storage.
     */
    public function destroy($id)
    {
        // Find the user with dentist role
        $user = User::where('role', 'dentist')->findOrFail($id);

        // Use transaction to ensure both dentist and user are deleted
        DB::transaction(function () use ($user) {
            // Delete the dentist profile
            $user->dentist()->delete();
            
            // Delete the user
            $user->delete();
        });

        return redirect()->route('admin.dentists')->with('success', 'Dentist deleted successfully.');
    }
}
