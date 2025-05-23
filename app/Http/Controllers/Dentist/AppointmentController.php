<?php

namespace App\Http\Controllers\Dentist;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            
        // Update the appointment
        $appointment->status = $request->status;
        
        if ($request->has('treatment_notes')) {
            $appointment->treatment_notes = $request->treatment_notes;
        }
        
        if ($request->status === 'cancelled' && $request->has('cancellation_reason')) {
            $appointment->cancellation_reason = $request->cancellation_reason;
        }
        
        $appointment->save();
        
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
            
        // Update the appointment status to confirmed
        $appointment->status = 'confirmed';
        $appointment->save();
        
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
            
        // Update the appointment status to completed
        $appointment->status = 'completed';
        $appointment->save();
        
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
            
        // Update the appointment status to cancelled
        $appointment->status = 'cancelled';
        
        if ($request->has('cancellation_reason')) {
            $appointment->cancellation_reason = $request->cancellation_reason;
        }
        
        $appointment->save();
        
        return redirect()->route('dentist.appointments')
            ->with('success', 'Appointment cancelled successfully.');
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
            
        // Create a new appointment with the suggested time
        $newAppointment = new Appointment();
        $newAppointment->patient_id = $appointment->patient_id;
        $newAppointment->dentist_id = $dentistId;
        $newAppointment->dental_service_id = $appointment->dental_service_id;
        $newAppointment->appointment_datetime = $request->appointment_datetime;
        $newAppointment->duration_minutes = $request->duration_minutes;
        $newAppointment->status = 'scheduled';
        $newAppointment->notes = $request->notes ?? 'Rescheduled from appointment #' . $appointment->id;
        $newAppointment->cost = $appointment->cost;
        $newAppointment->save();
        
        // Update the original appointment
        // Using 'cancelled' status since 'rescheduled' is not in the allowed enum values
        $appointment->status = 'cancelled';
        $appointment->cancellation_reason = 'Rescheduled to ' . date('Y-m-d H:i', strtotime($request->appointment_datetime));
        $appointment->save();
        
        return redirect()->route('dentist.appointments.show', $newAppointment->id)
            ->with('success', 'New appointment time suggested successfully.');
    }
}
