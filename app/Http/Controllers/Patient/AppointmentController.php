<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\Dentist;
use App\Models\DentistAvailability;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the patient's appointments.
     */
    public function index()
    {
        $patient = Auth::user()->patient;

        if (!$patient) {
            return redirect()->route('dashboard')->with('error', 'Patient profile not found.');
        }

        $appointments = Appointment::with(['dentist', 'dentalService'])
            ->where('patient_id', $patient->id)
            ->latest()
            ->get()
            ->map(function ($appointment) {
                // Get dentist name safely
                $dentistName = 'Unknown';
                if ($appointment->dentist) {
                    // Try to get from the dentist relationship first
                    if (method_exists($appointment->dentist, 'user') && $appointment->dentist->user) {
                        $dentistName = $appointment->dentist->user->name;
                    } elseif (isset($appointment->dentist->name)) {
                        // If dentist is actually a User model directly
                        $dentistName = $appointment->dentist->name;
                    }
                }

                return [
                    'id' => $appointment->id,
                    'dentist_name' => $dentistName,
                    'service_name' => $appointment->dentalService->name ?? 'Unknown',
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                ];
            });

        return Inertia::render('Patient/appointments', [
            'appointments' => $appointments,
        ]);
    }

    /**
     * Show the form for creating a new appointment.
     */
    public function create()
    {
        $dentalServices = DentalService::where('is_active', true)
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'price' => number_format((float)$service->price, 2),
                    'duration_minutes' => $service->duration_minutes,
                    'category' => $service->category,
                    'image_path' => $service->image_path,
                ];
            });

        $dentists = User::where('role', 'dentist')
            ->with('dentist')
            ->get()
            ->map(function ($user) {
                // Add null check for dentist relationship
                $dentist = $user->dentist ?? null;
                return [
                    'id' => $dentist ? $dentist->id : null,
                    'name' => $user->name,
                    'specialty' => $dentist ? $dentist->specialty : null,
                    'avatar' => $user->avatar_path,
                ];
            })
            ->filter(function ($dentist) {
                return $dentist['id'] !== null;
            })
            ->values();

        return Inertia::render('Patient/book-appointment', [
            'availableServices' => $dentalServices,
            'availableDentists' => $dentists,
        ]);
    }

    /**
     * Store a newly created appointment in storage.
     */
    public function store(Request $request)
    {
        // Log incoming request data
        Log::info('Appointment request received', ['data' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'dental_service_id' => 'required|exists:dental_services,id',
            'dentist_id' => 'required|exists:dentists,id',
            'appointment_date' => 'required|date|after:yesterday',
            'appointment_time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            Log::warning('Appointment validation failed', ['errors' => $validator->errors()->toArray()]);
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Get the authenticated user
            $user = Auth::user();

            // Get the authenticated user's patient record or create one if it doesn't exist
            $patient = $user->patient;

            // Create a patient record if one doesn't exist for this user
            if (!$patient && $user->isPatient()) {
                try {
                    Log::info('Creating patient profile for user', ['user_id' => $user->id]);
                    $patient = new Patient();
                    $patient->user_id = $user->id;
                    $patient->save();

                    // Refresh the user to get the newly created patient relation
                    $user->refresh();
                    $patient = $user->patient;

                    Log::info('Patient profile created', ['patient_id' => $patient->id]);
                } catch (\Exception $e) {
                    Log::error('Failed to create patient profile', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            // Check if patient exists after attempt to create
            if (!$patient) {
                Log::error('Patient profile not found for user', ['user_id' => Auth::id()]);
                return back()->withErrors([
                    'general' => 'Your patient profile could not be created. Please contact support.'
                ])->withInput();
            }

            Log::info('Patient found', ['patient_id' => $patient->id]);

            // Verify the dentist exists
            $dentist = Dentist::find($request->dentist_id);
            if (!$dentist) {
                Log::error('Dentist not found', ['dentist_id' => $request->dentist_id]);
                return back()->withErrors([
                    'dentist_id' => 'The selected dentist could not be found.'
                ])->withInput();
            }

            // Verify the dental service exists
            $dentalService = DentalService::find($request->dental_service_id);
            if (!$dentalService) {
                Log::error('Dental service not found', ['service_id' => $request->dental_service_id]);
                return back()->withErrors([
                    'dental_service_id' => 'The selected dental service could not be found.'
                ])->withInput();
            }

            // Combine date and time
            $appointmentDatetime = Carbon::parse(
                $request->appointment_date . ' ' . $request->appointment_time
            );

            // Log the exact time received and parsed
            Log::info('Appointment time details', [
                'raw_date' => $request->appointment_date,
                'raw_time' => $request->appointment_time,
                'parsed_datetime' => $appointmentDatetime->toDateTimeString(),
                'timezone' => config('app.timezone')
            ]);

            // Check if dentist is available at this time
            $isAvailable = $this->isDentistAvailable(
                $request->dentist_id,
                $appointmentDatetime,
                $dentalService->duration_minutes
            );

            if (!$isAvailable) {
                Log::warning('Dentist not available', [
                    'dentist_id' => $request->dentist_id,
                    'datetime' => $appointmentDatetime->toDateTimeString(),
                    'duration' => $dentalService->duration_minutes
                ]);
                return back()->withErrors([
                    'appointment_time' => 'The selected time is no longer available. Please choose another time.',
                ])->withInput();
            }

            // Create the appointment
            try {
                $appointment = new Appointment();
                $appointment->patient_id = $patient->id;
                $appointment->dentist_id = $request->dentist_id;
                $appointment->dental_service_id = $request->dental_service_id;
                $appointment->appointment_datetime = $appointmentDatetime;
                $appointment->duration_minutes = $dentalService->duration_minutes;
                $appointment->status = 'scheduled'; // Using 'scheduled' to match database enum
                $appointment->notes = $request->notes;
                $appointment->cost = $dentalService->price; // Set the cost from the dental service price

                // Log the appointment data before saving
                Log::info('Attempting to save appointment with data', [
                    'patient_id' => $appointment->patient_id,
                    'dentist_id' => $appointment->dentist_id,
                    'dental_service_id' => $appointment->dental_service_id,
                    'appointment_datetime' => $appointment->appointment_datetime->toDateTimeString(),
                    'duration_minutes' => $appointment->duration_minutes,
                    'status' => $appointment->status,
                    'cost' => $appointment->cost,
                ]);

                $appointment->save();

                Log::info('Appointment created successfully', ['appointment_id' => $appointment->id]);

                return redirect()->route('patient.appointments')->with('success', 'Appointment request submitted successfully.');
            } catch (\Exception $e) {
                Log::error('Failed to create appointment', [
                    'error' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                    'trace' => $e->getTraceAsString()
                ]);

                return back()->withErrors([
                    'general' => 'Failed to create appointment: ' . $e->getMessage()
                ])->withInput();
            }
        } catch (\Exception $e) {
            Log::error('Unexpected error in appointment creation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'general' => 'An unexpected error occurred. Please try again later.'
            ])->withInput();
        }
    }

    /**
     * Check if a dentist is available at a particular time
     */
    private function isDentistAvailable($dentistId, $dateTime, $duration)
    {
        // Check if time is within office hours (Mon-Sat, 9AM-12PM and 1PM-5PM)
        $dayOfWeek = $dateTime->dayOfWeek;
        $hour = $dateTime->hour;

        // Log the attempted booking time
        Log::info('Checking dentist availability', [
            'dentist_id' => $dentistId,
            'date_time' => $dateTime->toDateTimeString(),
            'day_of_week' => $dayOfWeek,
            'hour' => $hour,
            'duration' => $duration
        ]);

        // Sunday (0) is closed
        if ($dayOfWeek === 0) {
            Log::warning('Appointment rejected: Sunday is not available');
            return false;
        }

        // Check if within business hours (9AM-12PM, 1PM-5PM)
        if (($hour < 9 || $hour >= 17) || ($hour >= 12 && $hour < 13)) {
            Log::warning('Appointment rejected: Outside business hours');
            return false;
        }

        // For the fixed time slots approach, we'll just check if there are any
        // overlapping appointments already scheduled
        $date = $dateTime->toDateString();
        $startTime = $dateTime->format('H:i:s');

        // Calculate the end time by adding the service duration to the start time
        $appointmentEndDateTime = $dateTime->copy()->addMinutes($duration);
        $endTime = $appointmentEndDateTime->format('H:i:s');

        // Log the availability check
        Log::info('Dentist availability check result', [
            'dentist_id' => $dentistId,
            'start_time' => $dateTime->toDateTimeString(),
            'end_time' => $appointmentEndDateTime->toDateTimeString(),
            'is_available' => true // Default value, will be changed if not available
        ]);

        // Check for overlapping appointments
        $overlappingAppointments = Appointment::where('dentist_id', $dentistId)
            ->whereDate('appointment_datetime', $date)
            ->where('status', '!=', 'cancelled')
            ->where(function ($query) use ($startTime, $endTime, $date) {
                $start = $date . ' ' . $startTime;
                $end = $date . ' ' . $endTime;

                $query->where(function ($q) use ($start, $end) {
                    // Appointment starts during our time slot
                    $q->where('appointment_datetime', '>=', $start)
                      ->where('appointment_datetime', '<', $end);
                })->orWhere(function ($q) use ($start, $end) {
                    // Appointment ends during our time slot
                    $appointmentEnd = DB::raw('DATE_ADD(appointment_datetime, INTERVAL duration_minutes MINUTE)');
                    $q->where($appointmentEnd, '>', $start)
                      ->where($appointmentEnd, '<=', $end);
                })->orWhere(function ($q) use ($start, $end) {
                    // Appointment encompasses our time slot
                    $appointmentEnd = DB::raw('DATE_ADD(appointment_datetime, INTERVAL duration_minutes MINUTE)');
                    $q->where('appointment_datetime', '<=', $start)
                      ->where($appointmentEnd, '>=', $end);
                });
            })
            ->exists();

        $isAvailable = !$overlappingAppointments;
        Log::info('Dentist availability check result', [
            'dentist_id' => $dentistId,
            'start_time' => $dateTime->toDateTimeString(),
            'end_time' => $appointmentEndDateTime->toDateTimeString(),
            'is_available' => $isAvailable
        ]);

        return $isAvailable;
    }

    /**
     * API endpoint to get available time slots for a specific date and dentist
     */
    public function getAvailableTimeSlots(Request $request)
    {
        $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'service_id' => 'required|exists:dental_services,id',
            'date' => 'required|date|after:yesterday',
        ]);

        $dentistId = $request->dentist_id;
        $serviceId = $request->service_id;
        $date = $request->date;
        
        // Log existing appointments for this dentist on this date to help with debugging
        $existingAppointments = Appointment::where('dentist_id', $dentistId)
            ->whereDate('appointment_datetime', $date)
            ->where('status', '!=', 'cancelled')
            ->get();
            
        Log::info('Existing appointments for dentist on this date', [
            'dentist_id' => $dentistId,
            'date' => $date,
            'appointment_count' => $existingAppointments->count(),
            'appointments' => $existingAppointments->map(function($appointment) {
                return [
                    'id' => $appointment->id,
                    'time' => $appointment->appointment_datetime->format('H:i'),
                    'duration' => $appointment->duration_minutes
                ];
            })
        ]);

        $dentalService = DentalService::findOrFail($serviceId);
        $duration = $dentalService->duration_minutes;

        // Generate time slots for fixed clinic hours (09:00–17:00, 30-min increments)
        $startTime = Carbon::parse($date . ' 09:00:00');
        $endTime = Carbon::parse($date . ' 17:00:00');

        $timeSlots = [];
        $currentTime = $startTime->copy();
        $lunchBreakStart = Carbon::parse($date . ' 12:00:00');
        $lunchBreakEnd = Carbon::parse($date . ' 13:00:00');

        // Generate time slots in 30-minute increments
        while ($currentTime < $endTime) {
            // Skip lunch break hours (12 PM - 1 PM)
            if ($currentTime >= $lunchBreakStart && $currentTime < $lunchBreakEnd) {
                $currentTime = $lunchBreakEnd->copy();
                continue;
            }

            // Check if this slot is available
            $slotEndTime = $currentTime->copy()->addMinutes($duration);

            // Skip if slot end time exceeds dentist availability
            if ($slotEndTime > $endTime) {
                $currentTime->addMinutes(30);
                continue;
            }

            // Skip time slots that overlap with lunch break
            if ($currentTime < $lunchBreakStart && $slotEndTime > $lunchBreakStart) {
                $currentTime->addMinutes(30);
                continue;
            }

            $isAvailable = $this->isDentistAvailable(
                $dentistId,
                $currentTime->copy(),
                $duration
            );

            $timeSlots[] = [
                'time' => $currentTime->format('H:i'),
                'available' => $isAvailable,
            ];

            // Advance to the next time slot (30 minutes later)
            $currentTime->addMinutes(30);
        }

        return response()->json([
            'timeSlots' => $timeSlots,
        ]);
    }

    /**
     * Cancel an appointment.
     */
    public function cancel($id)
    {
        $patient = Auth::user()->patient;

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $patient->id)
            ->first();

        if (!$appointment) {
            return back()->with('error', 'Appointment not found.');
        }

        // Only allow cancellation of pending or approved appointments
        if (!in_array($appointment->status, ['pending', 'approved'])) {
            return back()->with('error', 'This appointment cannot be cancelled.');
        }

        // Check if appointment is within 24 hours - don't allow cancellation if so
        $appointmentTime = Carbon::parse($appointment->appointment_datetime);
        $now = Carbon::now();

        if ($appointmentTime->diffInHours($now) < 24) {
            return back()->with('error', 'Appointments cannot be cancelled within 24 hours.');
        }

        $appointment->status = 'cancelled';
        $appointment->cancellation_reason = 'Cancelled by patient';
        $appointment->save();

        return back()->with('success', 'Appointment cancelled successfully.');
    }
}
