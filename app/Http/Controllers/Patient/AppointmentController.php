<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\Dentist;
use App\Models\DentistAvailability;
use App\Models\DentistBlockedDate;
use App\Models\DentistWorkingHour;
use App\Models\Patient;
use App\Models\User;
use App\Notifications\AppointmentBookedNotification;
use App\Notifications\AppointmentStatusChangedNotification;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
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

        // Get appointments with related data
        $appointments = Appointment::with(['dentist', 'dentalService'])
            ->where('patient_id', $patient->id)
            ->latest()
            ->get()
            ->map(function ($appointment) {
                // Get dentist name from the relationship
                $dentistName = 'Unknown';
                
                if ($appointment->dentist) {
                    // Add the Dr. prefix for professional display
                    $dentistName = 'Dr. ' . $appointment->dentist->name;
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
     * Display the specified appointment.
     */
    public function show(int $id)
    {
        $patient = Auth::user()->patient;

        if (!$patient) {
            return redirect()->route('dashboard')->with('error', 'Patient profile not found.');
        }

        // Find the appointment and ensure it belongs to the current patient
        $appointment = Appointment::with(['dentist', 'dentalService'])
            ->where('patient_id', $patient->id)
            ->where('id', $id)
            ->firstOrFail();

        // Format the appointment data for the frontend
        $appointmentData = [
            'id' => $appointment->id,
            'dentist_name' => $appointment->dentist ? 'Dr. ' . $appointment->dentist->name : 'Unknown',
            'service_name' => $appointment->dentalService->name ?? 'Unknown',
            'appointment_datetime' => $appointment->appointment_datetime,
            'status' => $appointment->status,
            'duration_minutes' => $appointment->duration_minutes,
            'cost' => number_format((float)$appointment->cost, 2),
            'notes' => $appointment->notes,
            'treatment_notes' => $appointment->treatment_notes,
            'cancellation_reason' => $appointment->cancellation_reason,
        ];

        return Inertia::render('Patient/appointment-details', [
            'appointment' => $appointmentData,
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

        // Get all users with dentist role
        // Explicitly exclude admin users (role = 'admin')
        $dentists = User::where('role', 'dentist')
            ->where('id', '!=', 1) // Exclude user_id 1 (admin)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id, // Use user_id instead of dentist.id to match migration constraint
                    'name' => $user->name,
                    'specialty' => 'General Dentistry', // Default specialty if not specified
                    'avatar' => $user->avatar_path,
                ];
            })
            ->values();
            
        // Log the dentists for debugging
        \Illuminate\Support\Facades\Log::info('Available dentists for booking', [
            'count' => $dentists->count(),
            'dentists' => $dentists
        ]);

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
                $appointment->status = 'pending'; // Initial status is pending until dentist reviews
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
                
                // Send notification to patient
                try {
                    $patient->user->notify(new AppointmentBookedNotification($appointment));
                    
                    // Also send notification to dentist
                    $dentistUser = User::find($appointment->dentist_id);
                    if ($dentistUser) {
                        $dentistUser->notify(new AppointmentBookedNotification($appointment));
                    }
                    
                    Log::info('Appointment notifications sent', [
                        'appointment_id' => $appointment->id,
                        'patient_id' => $patient->id,
                        'dentist_id' => $appointment->dentist_id
                    ]);
                } catch (\Exception $e) {
                    // Log the error but don't interrupt the user flow
                    Log::error('Failed to send appointment notifications', [
                        'appointment_id' => $appointment->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }

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
        $date = $dateTime->toDateString();
        $startTime = $dateTime->format('H:i:s');
        $dayOfWeek = $dateTime->dayOfWeek; // 0 (Sunday) to 6 (Saturday)

        // Calculate the end time by adding the service duration to the start time
        $appointmentEndDateTime = $dateTime->copy()->addMinutes($duration);
        $endTime = $appointmentEndDateTime->format('H:i:s');

        Log::info('Checking dentist availability', [
            'dentist_id' => $dentistId,
            'date' => $date,
            'day_of_week' => $dayOfWeek,
            'start_time' => $startTime,
            'end_time' => $endTime,
            'duration' => $duration
        ]);

        // Step 1: Check if the dentist has working hours for this day of the week
        $workingHours = DentistWorkingHour::where('dentist_id', $dentistId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->first();

        if (!$workingHours) {
            Log::info('Dentist is not working on this day', [
                'dentist_id' => $dentistId,
                'day_of_week' => $dayOfWeek,
                'date' => $date
            ]);
            return false; // Dentist doesn't work on this day
        }

        // Step 2: Check if the appointment time is within the dentist's working hours
        $workingStartTime = $workingHours->start_time;
        $workingEndTime = $workingHours->end_time;

        if ($startTime < $workingStartTime || $endTime > $workingEndTime) {
            Log::info('Appointment time is outside working hours', [
                'dentist_id' => $dentistId,
                'appointment_start' => $startTime,
                'appointment_end' => $endTime,
                'working_start' => $workingStartTime,
                'working_end' => $workingEndTime
            ]);
            return false; // Appointment time is outside working hours
        }
        
        // Step 3: Check if the date is blocked
        $blockedDate = DentistBlockedDate::where('dentist_id', $dentistId)
            ->whereDate('blocked_date', $date)
            ->where(function ($query) use ($startTime, $endTime) {
                // Check if the appointment overlaps with any blocked time
                $query->where(function ($q) use ($startTime, $endTime) {
                    // Blocked time starts during our appointment
                    $q->where('start_time', '>=', $startTime)
                      ->where('start_time', '<', $endTime);
                })->orWhere(function ($q) use ($startTime, $endTime) {
                    // Blocked time ends during our appointment
                    $q->where('end_time', '>', $startTime)
                      ->where('end_time', '<=', $endTime);
                })->orWhere(function ($q) use ($startTime, $endTime) {
                    // Blocked time encompasses our appointment
                    $q->where('start_time', '<=', $startTime)
                      ->where('end_time', '>=', $endTime);
                })->orWhereNull('start_time')->orWhereNull('end_time'); // Full day block
            })
            ->exists();

        if ($blockedDate) {
            Log::info('Date is blocked for this dentist', [
                'dentist_id' => $dentistId,
                'date' => $date
            ]);
            return false; // Date is blocked
        }

        // Step 4: Check for overlapping appointments
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
            'dentist_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:dental_services,id',
            'date' => 'required|date|after:yesterday',
        ]);
        
        // Log the request parameters for debugging
        Log::info('Time slots request parameters', [
            'dentist_id' => $request->dentist_id,
            'service_id' => $request->service_id,
            'date' => $request->date
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
    public function cancel(Request $request, $id)
    {
        $patient = Auth::user()->patient;

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $patient->id)
            ->first();

        if (!$appointment) {
            return back()->with('error', 'Appointment not found.');
        }

        // Only allow cancellation of pending, suggested, or confirmed appointments
        if (!in_array($appointment->status, ['pending', 'suggested', 'confirmed'])) {
            return back()->with('error', 'This appointment cannot be cancelled.');
        }

        // No time restriction for cancellations
        $appointmentTime = Carbon::parse($appointment->appointment_datetime);
        $now = Carbon::now();
        
        // Log cancellation attempt
        Log::info('Appointment cancellation attempt', [
            'appointment_id' => $appointment->id,
            'current_time' => $now->toDateTimeString(),
            'appointment_time' => $appointmentTime->toDateTimeString(),
            'hours_difference' => $appointmentTime->diffInHours($now)
        ]);

        // Store old status for notification
        $oldStatus = $appointment->status;
        
        // Get custom cancellation reason if provided
        $cancellationReason = $request->input('cancellation_reason') ?: 'Cancelled by patient';
        
        $appointment->status = 'cancelled';
        $appointment->cancellation_reason = $cancellationReason;
        $appointment->save();
        
        // Log the cancellation reason
        Log::info('Appointment cancelled with reason', [
            'appointment_id' => $appointment->id, 
            'reason' => $cancellationReason
        ]);
        
        // Send notification to dentist about cancellation
        try {
            // Find the dentist's user record
            $dentistUser = User::find($appointment->dentist_id);
            
            if ($dentistUser) {
                $dentistUser->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    $oldStatus,
                    $cancellationReason
                ));
                
                Log::info('Appointment cancellation notification sent to dentist', [
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $appointment->status,
                    'patient_id' => $appointment->patient_id,
                    'dentist_id' => $appointment->dentist_id
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

        return back()->with('success', 'Appointment cancelled successfully.');
    }
    
    /**
     * Confirm a suggested appointment time.
     */
    public function confirmSuggestion($id)
    {
        $patient = Auth::user()->patient;

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $patient->id)
            ->first();

        if (!$appointment) {
            return back()->with('error', 'Appointment not found.');
        }

        // Only allow confirmation of suggested appointments
        if ($appointment->status !== 'suggested') {
            return back()->with('error', 'This appointment cannot be confirmed.');
        }

        // Store old status for notification
        $oldStatus = $appointment->status;
        
        $appointment->status = 'confirmed';
        $appointment->save();
        
        // Send notification to dentist about confirmation
        try {
            // Find the dentist's user record
            $dentistUser = User::find($appointment->dentist_id);
            
            if ($dentistUser) {
                $dentistUser->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    $oldStatus
                ));
                
                Log::info('Appointment confirmation notification sent to dentist', [
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $appointment->status,
                    'patient_id' => $appointment->patient_id,
                    'dentist_id' => $appointment->dentist_id
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

        return back()->with('success', 'Appointment confirmed successfully.');
    }
    
    /**
     * Decline a suggested appointment time.
     */
    public function declineSuggestion($id)
    {
        $patient = Auth::user()->patient;

        $appointment = Appointment::where('id', $id)
            ->where('patient_id', $patient->id)
            ->first();

        if (!$appointment) {
            return back()->with('error', 'Appointment not found.');
        }

        // Only allow declining of suggested appointments
        if ($appointment->status !== 'suggested') {
            return back()->with('error', 'This appointment cannot be declined.');
        }

        // Store old status for notification
        $oldStatus = $appointment->status;
        $cancellationReason = 'Patient declined suggested time';
        
        $appointment->status = 'cancelled';
        $appointment->cancellation_reason = $cancellationReason;
        $appointment->save();
        
        // Send notification to dentist about declining suggestion
        try {
            // Find the dentist's user record
            $dentistUser = User::find($appointment->dentist_id);
            
            if ($dentistUser) {
                $dentistUser->notify(new AppointmentStatusChangedNotification(
                    $appointment,
                    $oldStatus,
                    $cancellationReason
                ));
                
                Log::info('Appointment decline notification sent to dentist', [
                    'appointment_id' => $appointment->id,
                    'old_status' => $oldStatus,
                    'new_status' => $appointment->status,
                    'patient_id' => $appointment->patient_id,
                    'dentist_id' => $appointment->dentist_id
                ]);
            }
        } catch (\Exception $e) {
            // Log the error but don't interrupt the user flow
            Log::error('Failed to send appointment decline notification', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return back()->with('success', 'Suggested appointment time declined.');
    }
}
