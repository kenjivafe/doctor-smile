<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the appointments.
     */
    public function index()
    {
        $appointments = Appointment::with([
            'patient',
            'dentist',
            'dentalService'
        ])->latest()->paginate(10);

        return Inertia::render('Admin/Appointments/Index', [
            'appointments' => $appointments->transform(function ($appointment) {
                $patient = $appointment->patient;
                $dentist = $appointment->dentist;
                $patientUser = $patient ? $patient->user : null;
                
                return [
                    'id' => $appointment->id,
                    'patient_name' => $patientUser ? $patientUser->name : 'Unknown Patient',
                    'patient_id' => $appointment->patient_id,
                    'dentist_name' => $dentist ? $dentist->name : 'Unknown Dentist',
                    'dentist_id' => $appointment->dentist_id,
                    'service_name' => $appointment->dentalService ? $appointment->dentalService->name : 'No Service',
                    'service_id' => $appointment->service_id,
                    'appointment_datetime' => $appointment->appointment_datetime->toDateTimeString(),
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                    'cost' => $appointment->cost,
                    'payment_status' => $appointment->payment_status,
                    'notes' => $appointment->notes,
                    'cancellation_reason' => $appointment->cancellation_reason,
                ];
            }),
        ]);
    }

    /**
     * Display the specified appointment.
     */
    public function show(Appointment $appointment)
    {
        $appointment->load([
            'patient',
            'dentist', 
            'dentalService'
        ]);

        // Get the patient and dentist users
        $patient = $appointment->patient;
        $dentist = $appointment->dentist;
        
        // Since the dentist is already a User, we can access name directly
        // For patient, we need to get the user first
        $patientUser = $patient ? $patient->user : null;

        return Inertia::render('Admin/appointment-details', [
            'appointment' => [
                'id' => $appointment->id,
                'patient_name' => $patientUser ? $patientUser->name : 'Unknown Patient',
                'patient_id' => $appointment->patient_id,
                'dentist_name' => $dentist ? $dentist->name : 'Unknown Dentist',
                'dentist_id' => $appointment->dentist_id,
                'service_name' => $appointment->dentalService ? $appointment->dentalService->name : 'No Service',
                'service_id' => $appointment->service_id,
                'appointment_datetime' => $appointment->appointment_datetime->toDateTimeString(),
                'status' => $appointment->status,
                'duration_minutes' => $appointment->duration_minutes,
                'cost' => $appointment->cost,
                'payment_status' => $appointment->payment_status,
                'notes' => $appointment->notes,
                'cancellation_reason' => $appointment->cancellation_reason,
                'created_at' => $appointment->created_at->toDateTimeString(),
                'updated_at' => $appointment->updated_at->toDateTimeString(),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified appointment.
     */
    /**
     * Show the form for editing the specified appointment.
     */
    public function edit(Appointment $appointment)
    {
        $appointment->load(['patient.user', 'dentist.user', 'service']);
        
        $dentists = User::where('role', 'dentist')
            ->with('dentist')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->dentist->id,
                    'name' => $user->name,
                ];
            });
            
        $services = DentalService::all(['id', 'name', 'duration', 'cost']);

        return Inertia::render('Admin/Appointments/Edit', [
            'appointment' => [
                'id' => $appointment->id,
                'patient_name' => $appointment->patient->user->name,
                'patient_id' => $appointment->patient_id,
                'dentist_name' => $appointment->dentist->user->name,
                'dentist_id' => $appointment->dentist_id,
                'service_name' => $appointment->service->name,
                'service_id' => $appointment->service_id,
                'appointment_datetime' => $appointment->appointment_datetime->toDateTimeString(),
                'status' => $appointment->status,
                'duration_minutes' => $appointment->duration_minutes,
                'cost' => $appointment->cost,
                'payment_status' => $appointment->payment_status,
                'notes' => $appointment->notes,
                'cancellation_reason' => $appointment->cancellation_reason,
            ],
            'dentists' => $dentists,
            'services' => $services,
        ]);
    }

    /**
     * Update the specified appointment in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        $validated = $request->validate([
            'status' => 'sometimes|required|in:pending,confirmed,completed,cancelled',
            'dentist_id' => 'sometimes|required|exists:dentists,id',
            'service_id' => 'sometimes|required|exists:dental_services,id',
            'appointment_datetime' => 'sometimes|required|date',
            'payment_status' => 'sometimes|required|in:paid,unpaid',
            'notes' => 'nullable|string',
            'cancellation_reason' => 'required_if:status,cancelled|nullable|string',
        ]);

        // If status is being changed to cancelled, ensure cancellation reason is provided
        if (isset($validated['status']) && $validated['status'] === 'cancelled' && empty($validated['cancellation_reason'])) {
            return back()->withErrors([
                'cancellation_reason' => 'Cancellation reason is required when cancelling an appointment.'
            ]);
        }

        // If status is being changed to something other than cancelled, remove any existing cancellation reason
        if (isset($validated['status']) && $validated['status'] !== 'cancelled') {
            $validated['cancellation_reason'] = null;
        }

        // Only update service-related fields if service_id is being updated
        if (isset($validated['service_id'])) {
            $service = DentalService::findOrFail($validated['service_id']);
            $validated['duration_minutes'] = $service->duration;
            $validated['cost'] = $service->cost;
        }

        $appointment->update($validated);

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json(['message' => 'Appointment updated successfully.']);
        }

        return redirect()->route('admin.appointments.show', $appointment->id)
            ->with('success', 'Appointment updated successfully.');
    }

    /**
     * Cancel the specified appointment.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Appointment  $appointment
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancel(Request $request, Appointment $appointment)
    {
        // Validate the request
        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:1000',
        ]);

        // Only allow cancelling pending or confirmed appointments
        if (!in_array($appointment->status, ['pending', 'confirmed'])) {
            return redirect()
                ->back()
                ->with('error', 'Only pending or confirmed appointments can be cancelled.');
        }

        // Update the appointment status and cancellation reason
        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        // TODO: Send notification to patient about cancellation
        
        return redirect()
            ->route('admin.appointments.show', $appointment)
            ->with('success', 'Appointment has been cancelled successfully.');
    }
}
