<?php

namespace App\Http\Controllers\Dentist;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\Patient;
use App\Models\User;
use App\Notifications\AppointmentStatusChangedNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the dentist's appointments.
     */
    public function index()
    {
        $userId = Auth::id();
        
        // Get appointments with related data
        // The dentist_id in appointments table references the users table directly
        $appointments = Appointment::with(['patient.user', 'dentalService'])
            ->where('dentist_id', $userId)
            ->latest()
            ->get();
        
        $appointments = $appointments->map(function ($appointment) {
                // Get patient name from the relationship
                $patientName = 'Unknown';
                
                if ($appointment->patient && $appointment->patient->user) {
                    $patientName = $appointment->patient->user->name;
                }

                return [
                    'id' => $appointment->id,
                    'patient_name' => $patientName,
                    'service_name' => $appointment->dentalService->name ?? 'Unknown',
                    'dental_service_id' => $appointment->dental_service_id,
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                    'cost' => number_format((float)$appointment->cost, 2),
                ];
            });

        return Inertia::render('Dentist/appointments', [
            'appointments' => $appointments,
        ]);
    }
    
    /**
     * Display the specified appointment.
     */
    public function show(int $id)
    {
        $userId = Auth::id();
        
        // Find the appointment and ensure it belongs to the current dentist
        // The dentist_id in appointments table references the users table directly
        $appointment = Appointment::with(['patient.user', 'dentalService'])
            ->where('dentist_id', $userId)
            ->where('id', $id)
            ->firstOrFail();

        // Format the appointment data for the frontend
        $appointmentData = [
            'id' => $appointment->id,
            'patient_name' => $appointment->patient->user->name ?? 'Unknown',
            'patient_email' => $appointment->patient->user->email ?? '',
            'patient_phone' => $appointment->patient->phone ?? '',
            'service_name' => $appointment->dentalService->name ?? 'Unknown',
            'appointment_datetime' => $appointment->appointment_datetime,
            'status' => $appointment->status,
            'duration_minutes' => $appointment->duration_minutes,
            'cost' => number_format((float)$appointment->cost, 2),
            'notes' => $appointment->notes,
            'treatment_notes' => $appointment->treatment_notes,
            'cancellation_reason' => $appointment->cancellation_reason,
        ];

        return Inertia::render('Dentist/appointment-details', [
            'appointment' => $appointmentData,
        ]);
    }

    /**
     * Update the appointment status.
     */
    public function updateStatus(Request $request, int $id)
    {
        $dentistId = Auth::id();
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,completed,cancelled',
            'treatment_notes' => 'nullable|string|max:1000',
            'cancellation_reason' => 'nullable|required_if:status,cancelled|string|max:255',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Find the appointment and ensure it belongs to the current dentist
        $appointment = Appointment::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
            
        // Store old status for notification
        $oldStatus = $appointment->status;
        
        // Update the appointment
        $appointment->status = $request->status;
        
        if ($request->has('treatment_notes')) {
            $appointment->treatment_notes = $request->treatment_notes;
        }
        
        if ($request->status === 'cancelled' && $request->has('cancellation_reason')) {
            $appointment->cancellation_reason = $request->cancellation_reason;
        }
        
        $appointment->save();
        
        // Send notification to patient about status change
        try {
            // Make sure we have the patient relationship loaded
            if (!$appointment->relationLoaded('patient')) {
                $appointment->load('patient.user');
            }
            
            if ($appointment->patient && $appointment->patient->user) {
                $appointment->patient->user->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    $oldStatus,
                    $request->status === 'cancelled' ? $request->cancellation_reason : null
                ));
                
                Log::info('Appointment status change notification sent', [
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $appointment->status,
                    'patient_id' => $appointment->patient->id
                ]);
            }
        } catch (\Exception $e) {
            // Log the error but don't interrupt the user flow
            Log::error('Failed to send appointment status notification', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        return redirect()->route('dentist.appointments.show', $appointment->id)
            ->with('success', 'Appointment status updated successfully.');
    }
    
    /**
     * Confirm an appointment.
     */
    public function confirm(int $id)
    {
        $dentistId = Auth::id();
        
        // Find the appointment and ensure it belongs to the current dentist
        $appointment = Appointment::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
            
        // Only allow confirming pending appointments
        if ($appointment->status !== 'pending') {
            return back()->with('error', 'Only pending appointments can be confirmed.');
        }
        
        // Store old status for notification
        $oldStatus = $appointment->status;
            
        // Update the appointment status to confirmed
        $appointment->status = 'confirmed';
        $appointment->save();
        
        // Send notification to patient about confirmation
        try {
            // Make sure we have the patient relationship loaded
            if (!$appointment->relationLoaded('patient')) {
                $appointment->load('patient.user');
            }
            
            if ($appointment->patient && $appointment->patient->user) {
                $appointment->patient->user->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    $oldStatus
                ));
                
                Log::info('Appointment confirmation notification sent', [
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $appointment->status,
                    'patient_id' => $appointment->patient->id
                ]);
            }
        } catch (\Exception $e) {
            // Log the error but don't interrupt the user flow
            Log::error('Failed to send appointment confirmation notification', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        return redirect()->route('dentist.appointments')
            ->with('success', 'Appointment confirmed successfully.');
    }
    
    /**
     * Complete an appointment.
     */
    public function complete(int $id)
    {
        $dentistId = Auth::id();
        
        // Find the appointment and ensure it belongs to the current dentist
        $appointment = Appointment::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
        
        // Store old status for notification
        $oldStatus = $appointment->status;
            
        // Update the appointment status to completed
        $appointment->status = 'completed';
        $appointment->save();
        
        // Send notification to patient about completion
        try {
            // Make sure we have the patient relationship loaded
            if (!$appointment->relationLoaded('patient')) {
                $appointment->load('patient.user');
            }
            
            if ($appointment->patient && $appointment->patient->user) {
                $appointment->patient->user->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    $oldStatus
                ));
                
                Log::info('Appointment completion notification sent', [
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $appointment->status,
                    'patient_id' => $appointment->patient->id
                ]);
            }
        } catch (\Exception $e) {
            // Log the error but don't interrupt the user flow
            Log::error('Failed to send appointment completion notification', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        return redirect()->route('dentist.appointments')
            ->with('success', 'Appointment marked as completed.');
    }
    
    /**
     * Cancel (reject) an appointment.
     */
    public function cancel(int $id, Request $request)
    {
        $dentistId = Auth::id();
        
        // Validate the request if there's a cancellation reason
        if ($request->has('cancellation_reason')) {
            $validator = Validator::make($request->all(), [
                'cancellation_reason' => 'required|string|max:255',
            ]);
            
            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }
        }
        
        // Find the appointment and ensure it belongs to the current dentist
        $appointment = Appointment::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
            
        // Only allow cancelling pending, suggested, or confirmed appointments
        if (!in_array($appointment->status, ['pending', 'suggested', 'confirmed'])) {
            return back()->with('error', 'Only pending, suggested, or confirmed appointments can be cancelled.');
        }
        
        // Store old status for notification
        $oldStatus = $appointment->status;
            
        // Update the appointment status to cancelled
        $appointment->status = 'cancelled';
        
        // Set cancellation reason
        $cancellationReason = '';
        if ($request->has('cancellation_reason')) {
            $appointment->cancellation_reason = $request->cancellation_reason;
            $cancellationReason = $request->cancellation_reason;
        } else {
            if ($oldStatus === 'suggested') {
                $cancellationReason = 'Suggestion cancelled by dentist';
                $appointment->cancellation_reason = $cancellationReason;
            } else {
                $cancellationReason = 'Rejected by dentist';
                $appointment->cancellation_reason = $cancellationReason;
            }
        }
        
        $appointment->save();
        
        // Send notification to patient about cancellation
        try {
            // Make sure we have the patient relationship loaded
            if (!$appointment->relationLoaded('patient')) {
                $appointment->load('patient.user');
            }
            
            if ($appointment->patient && $appointment->patient->user) {
                $appointment->patient->user->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    $oldStatus,
                    $cancellationReason
                ));
                
                Log::info('Appointment cancellation notification sent', [
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $appointment->status,
                    'reason' => $cancellationReason,
                    'patient_id' => $appointment->patient->id
                ]);
            }
        } catch (\Exception $e) {
            // Log the error but don't interrupt the user flow
            Log::error('Failed to send appointment cancellation notification', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        return redirect()->route('dentist.appointments')
            ->with('success', 'Appointment rejected successfully.');
    }

    /**
     * Update treatment notes for the appointment.
     */
    public function updateNotes(Request $request, int $id)
    {
        $dentistId = Auth::id();
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'treatment_notes' => 'nullable|string|max:1000',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Find the appointment and ensure it belongs to the current dentist
        $appointment = Appointment::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
            
        // Update the treatment notes
        $appointment->treatment_notes = $request->treatment_notes;
        $appointment->save();
        
        return redirect()->route('dentist.appointments.show', $appointment->id)
            ->with('success', 'Treatment notes updated successfully.');
    }

    /**
     * Suggest a new time for the appointment.
     */
    public function suggestNewTime(Request $request, int $id)
    {
        $dentistId = Auth::id();
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'appointment_datetime' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:240',
            'notes' => 'nullable|string|max:1000',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Find the appointment and ensure it belongs to the current dentist
        $appointment = Appointment::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
            
        // Only allow suggesting new times for pending appointments
        if ($appointment->status !== 'pending') {
            return back()->with('error', 'You can only suggest new times for pending appointments.');
        }
        
        // Update the appointment with the suggested time
        $oldDateTime = $appointment->appointment_datetime;
        $appointment->appointment_datetime = $request->appointment_datetime;
        $appointment->duration_minutes = $request->duration_minutes;
        $appointment->status = 'suggested';
        
        // Add a note about the time change
        $suggestionNote = 'Dentist suggested a new time. Original time was: ' . date('Y-m-d H:i', strtotime($oldDateTime));
        $appointment->notes = $appointment->notes ? $appointment->notes . "\n\n" . $suggestionNote : $suggestionNote;
        
        if ($request->notes) {
            $appointment->notes .= "\n\nDentist's note: " . $request->notes;
        }
        
        $appointment->save();
        
        // Send notification to patient about the suggested new time
        try {
            // Make sure we have the patient relationship loaded
            if (!$appointment->relationLoaded('patient')) {
                $appointment->load('patient.user');
            }
            
            if ($appointment->patient && $appointment->patient->user) {
                $appointment->patient->user->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    'pending',
                    $request->notes ?: 'Your dentist has suggested a new appointment time'
                ));
                
                Log::info('Appointment reschedule notification sent', [
                    'appointment_id' => $appointment->id,
                    'old_datetime' => $oldDateTime,
                    'new_datetime' => $appointment->appointment_datetime,
                    'patient_id' => $appointment->patient->id
                ]);
            }
        } catch (\Exception $e) {
            // Log the error but don't interrupt the user flow
            Log::error('Failed to send appointment reschedule notification', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
        
        return redirect()->route('dentist.appointments.show', $appointment->id)
            ->with('success', 'New appointment time suggested successfully. Waiting for patient confirmation.');
    }
}
