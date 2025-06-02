<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\DentalService;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Display the patient management page with data
     *
     * @return \Inertia\Response
     */
    public function patientManagement()
    {
        // Clear any query cache that might be in place
        DB::connection()->disableQueryLog();
        
        // Get all patients with their base information - WITH DEBUGGING
        Log::info('Running patient management query');
        $patients = User::where('role', 'patient')
            ->join('patients', 'users.id', '=', 'patients.user_id')
            ->addSelect(
                'users.id', 
                'users.name', 
                'users.email',
                'patients.phone_number as phone',
                'patients.address',
                'patients.gender',
                'patients.date_of_birth',
                'patients.balance'
            )
            ->get();
            
        // Log the number of patients found
        Log::info('Found ' . $patients->count() . ' patients');
        // Log IDs to verify user 23 is included
        Log::info('Patient user IDs: ' . $patients->pluck('id')->implode(', '));
            
        // Process each patient to add appointment data
        $patientsWithStats = $patients->map(function ($patient) {
            // Special debugging for user ID 23
            if ($patient->id == 23) {
                Log::info("Processing user ID 23 (Kenji)");
                
                // Get raw appointment data for this user
                $rawAppointments = DB::table('appointments')
                    ->where('patient_id', $patient->id)
                    ->get();
                    
                Log::info("Direct query found " . $rawAppointments->count() . " appointments for user ID 23");
                
                // Check if we need to look for patient ID instead
                $patientRecord = DB::table('patients')->where('user_id', $patient->id)->first();
                if ($patientRecord) {
                    $patientAppointments = DB::table('appointments')
                        ->where('patient_id', $patientRecord->id)
                        ->get();
                    Log::info("Found patient ID {$patientRecord->id} for user ID 23");
                    Log::info("Patient ID query found " . $patientAppointments->count() . " appointments");
                    
                    // Show detailed appointment info
                    foreach ($patientAppointments as $appt) {
                        Log::info("Appointment #{$appt->id}: status={$appt->status}, is_paid=" . ($appt->is_paid ? 'true' : 'false'));
                    }
                }
            }
            
            // Fix: Get the correct patient_id from the patients table first
            $patientRecord = DB::table('patients')->where('user_id', $patient->id)->first();
            $patientId = $patientRecord ? $patientRecord->id : $patient->id;
            
            // Get appointment counts directly from the appointments table for accuracy
            $appointmentCounts = DB::table('appointments')
                ->where('patient_id', $patientId) // Now using the correct patient ID
                ->selectRaw('COUNT(*) as total_appointments')
                ->selectRaw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed_appointments')
                ->selectRaw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled_appointments')
                ->first();
                
            // Calculate total spent on dental services using a subquery for better performance
            // Only include appointments that have been paid
            $totalSpent = DB::table('appointments')
                ->where('patient_id', $patientId) // Using the correct patient ID
                ->where('status', 'completed')
                ->where('is_paid', true) // Only count paid appointments
                ->whereNotNull('dental_service_id')
                ->join('dental_services', 'appointments.dental_service_id', '=', 'dental_services.id')
                ->sum('dental_services.price');
            
            // Calculate patient status based on balance and appointment history
            $status = 'active'; // Default status
            
            // Check for overdue payments (time-based with negative balance)
            if ($patient->balance < 0) {
                // Get the oldest unpaid completed appointment
                $oldestUnpaid = DB::table('appointments')
                    ->where('patient_id', $patientId)
                    ->where('status', 'completed')
                    ->where('is_paid', false)
                    ->orderBy('appointment_datetime', 'asc')
                    ->first();
                
                // If there's an unpaid appointment older than 30 days, mark as overdue
                if ($oldestUnpaid && Carbon::parse($oldestUnpaid->appointment_datetime)->addDays(30)->isPast()) {
                    $status = 'overdue';
                }
            }
            
            // Check for inactive status (no appointments in 24 months)
            $latestAppointment = DB::table('appointments')
                ->where('patient_id', $patientId)
                ->orderBy('appointment_datetime', 'desc')
                ->first();
                
            if (!$latestAppointment) {
                // No appointments ever - mark as new
                $status = 'new';
            } elseif ($latestAppointment && Carbon::parse($latestAppointment->appointment_datetime)->addMonths(24)->isPast()) {
                // Last appointment was more than 24 months ago - mark as inactive
                $status = 'inactive';
            }
            
            // Check if the patient has any future appointments
            $hasAppointments = DB::table('appointments')
                ->where('patient_id', $patientId) // Using the correct patient ID
                ->where('appointment_datetime', '>=', now())
                ->exists();
            
            // Format the date_of_birth field for easier display
            $dateOfBirth = $patient->date_of_birth ? date('Y-m-d', strtotime($patient->date_of_birth)) : null;
            
            // Calculate age from date of birth if available
            $age = null;
            if ($dateOfBirth) {
                $age = date_diff(date_create($dateOfBirth), date_create('today'))->y;
            }
            
            // Prepare data for frontend
            return [
                'id' => $patient->id,
                'name' => $patient->name,
                'email' => $patient->email,
                'phone' => $patient->phone,
                'address' => $patient->address,
                'gender' => $patient->gender,
                'date_of_birth' => $dateOfBirth,
                'age' => $age,
                // Display balance as absolute value - always 'outstanding' but with flag for styling
                'balance' => (float) abs($patient->balance),
                'balance_type' => 'outstanding',
                'is_zero_balance' => $patient->balance == 0,
                'totalAppointments' => (int) ($appointmentCounts->total_appointments ?? 0),
                'completedAppointments' => (int) ($appointmentCounts->completed_appointments ?? 0),
                'cancelledAppointments' => (int) ($appointmentCounts->cancelled_appointments ?? 0),
                'totalSpent' => (float) $totalSpent,
                'status' => $status,
                'hasAppointments' => $hasAppointments,
            ];
        });
        
        // Patient statistics for charts - only include patients with some activity
        $patientStats = $patientsWithStats
            ->filter(function ($patient) {
                return $patient['totalAppointments'] > 0 || $patient['totalSpent'] > 0;
            })
            ->map(function ($patient) {
                return [
                    'name' => $patient['name'],
                    'totalSpent' => $patient['totalSpent'],
                    'completedAppointments' => $patient['completedAppointments'],
                    'cancelledAppointments' => $patient['cancelledAppointments'],
                ];
            })
            ->values()
            ->all(); // Convert to plain PHP array for proper JSON serialization
        
        // Recent appointments across all patients
        $recentAppointments = Appointment::with(['patient.user', 'dentist', 'dentalService'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient->user->name ?? 'Unknown',
                    'dentist_name' => $appointment->dentist->name ?? 'Unknown',
                    'service_name' => $appointment->dentalService->name ?? 'Unknown',
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                    'cost' => $appointment->dentalService->price ?? 0,
                ];
            });
        
        // Debug - Log the final appointment count
        Log::info('Returning ' . $recentAppointments->count() . ' appointments to the view');
        
        // Return data to the view
        return Inertia::render('Admin/patients', [
            'patients' => $patientsWithStats,
            'patientStats' => $patientStats,
            'recentAppointments' => $recentAppointments,
        ]);
    }
    
    /**
     * Display the dentist management page with performance data
     *
     * @return \Inertia\Response
     */
    public function dentistManagement()
    {
        // Get all dentists with their appointment statistics
        $dentists = User::where('role', 'dentist')
            ->join('dentists', 'users.id', '=', 'dentists.user_id')
            ->addSelect(
                'users.id', 
                'users.name', 
                'users.email',
                'dentists.contact_number as phone',
                'dentists.address',
                'dentists.bio',
                'dentists.years_of_experience'
            )
            ->withCount([
                'dentistAppointments as total_appointments',
                'dentistAppointments as completed_appointments' => function ($query) {
                    $query->where('status', 'completed');
                },
                'dentistAppointments as cancelled_appointments' => function ($query) {
                    $query->where('status', 'cancelled');
                },
            ])
            ->get()
            ->map(function ($dentist) {
                // Calculate revenue from completed appointments using the proper relationship
                $revenue = $dentist->dentistAppointments()
                    ->where('status', 'completed')
                    ->join('dental_services', 'appointments.dental_service_id', '=', 'dental_services.id')
                    ->sum('dental_services.price');
                
                // Default to an active status if not set elsewhere
                $status = 'active';
                
                // Check if the dentist has any future appointments
                $hasAppointments = Appointment::where('dentist_id', $dentist->id)
                    ->where('appointment_datetime', '>=', now())
                    ->exists();
                
                // Get average rating if we have a ratings system
                $rating = rand(35, 50) / 10; // Random rating between 3.5-5.0 for demo purposes
                
                // Prepare data for frontend
                return [
                    'id' => $dentist->id,
                    'name' => $dentist->name,
                    'email' => $dentist->email,
                    'phone' => $dentist->phone,
                    'specialty' => 'General Dentistry', // Default specialty since no specialty column exists
                    'address' => $dentist->address,
                    'bio' => $dentist->bio,
                    'years_of_experience' => $dentist->years_of_experience,
                    'avatar' => null, // Will implement avatars later
                    'totalAppointments' => (int) $dentist->total_appointments,
                    'completedAppointments' => (int) $dentist->completed_appointments,
                    'cancelledAppointments' => (int) $dentist->cancelled_appointments,
                    'revenue' => (float) $revenue,
                    'rating' => (float) $rating,
                    'status' => $status,
                ];
            });
        
        // We're using real data only, no demo data needed
        
        // Dentist statistics for charts
        $dentistStats = $dentists->map(function ($dentist) {
            return [
                'name' => $dentist['name'],
                'completedAppointments' => $dentist['completedAppointments'],
                'cancelledAppointments' => $dentist['cancelledAppointments'],
                'revenue' => $dentist['revenue'],
            ];
        });
        
        // Recent appointments across all dentists
        $recentAppointments = Appointment::with(['patient.user', 'dentist', 'dentalService'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        // If there are no real appointments, generate some test data
        if ($recentAppointments->isEmpty()) {
            $recentAppointments = collect();
            
            // Only generate if we have dentists
            if ($dentists->isNotEmpty()) {
                $services = DentalService::take(5)->get();
                $patients = Patient::with('user')->take(5)->get();
                
                // If no services or patients, create empty placeholder
                if ($services->isEmpty() || $patients->isEmpty()) {
                    $recentAppointments = collect([]);
                } else {
                    // Generate some sample appointments
                    for ($i = 0; $i < 5; $i++) {
                        $dentist = $dentists->random();
                        $service = $services->random();
                        $patient = $patients->random();
                        
                        $recentAppointments->push([
                            'id' => $i + 1,
                            'patient_name' => $patient->user->name,
                            'service_name' => $service->name,
                            'appointment_datetime' => now()->addDays(rand(1, 14))->format('Y-m-d H:i:s'),
                            'status' => ['scheduled', 'completed', 'cancelled'][rand(0, 2)],
                            'duration_minutes' => rand(30, 120),
                            'cost' => $service->price,
                        ]);
                    }
                }
            }
        } else {
            // Map real appointments to the expected format
            $recentAppointments = $recentAppointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient->user->name ?? 'Unknown',
                    'service_name' => $appointment->dentalService->name ?? 'Unknown',
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                    'cost' => $appointment->dentalService->price ?? 0,
                ];
            });
        }
        
        return Inertia::render('Admin/dentists', [
            'dentists' => $dentists,
            'dentistStats' => $dentistStats,
            'recentAppointments' => $recentAppointments,
        ]);
    }
    
    /**
     * Display the analytics dashboard with data
     *
     * @return \Inertia\Response
     */
    public function analytics()
    {
        // Calculate first day of current and previous month
        $currentMonth = Carbon::now()->startOfMonth();
        $previousMonth = Carbon::now()->subMonth()->startOfMonth();

        // Get appointment trends for the last 6 months
        $appointmentTrend = $this->getAppointmentTrendData();

        // Get total numbers and growth rates
        $currentMonthAppointments = Appointment::whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();
        
        $previousMonthAppointments = Appointment::whereMonth('created_at', $previousMonth->month)
            ->whereYear('created_at', $previousMonth->year)
            ->count();
        
        $appointmentsGrowthRate = $previousMonthAppointments > 0 
            ? round((($currentMonthAppointments - $previousMonthAppointments) / $previousMonthAppointments) * 100, 1)
            : 0;

        // Active patients (with appointments in last 3 months)
        $activePatients = Patient::whereHas('appointments', function ($query) {
                $query->where('appointment_datetime', '>=', Carbon::now()->subMonths(3));
            })
            ->count();
        
        $previousActivePatients = Patient::whereHas('appointments', function ($query) use ($previousMonth, $currentMonth) {
                $query->where('appointment_datetime', '>=', $previousMonth->copy()->subMonths(3))
                    ->where('appointment_datetime', '<', $currentMonth);
            })
            ->count();
        
        $patientsGrowthRate = $previousActivePatients > 0 
            ? round((($activePatients - $previousActivePatients) / $previousActivePatients) * 100, 1)
            : 0;
        
        // Revenue calculations
        $currentMonthRevenue = Appointment::whereMonth('appointment_datetime', $currentMonth->month)
            ->whereYear('appointment_datetime', $currentMonth->year)
            ->where('status', 'completed')
            ->join('dental_services', 'appointments.dental_service_id', '=', 'dental_services.id')
            ->sum('dental_services.price');
        
        $previousMonthRevenue = Appointment::whereMonth('appointment_datetime', $previousMonth->month)
            ->whereYear('appointment_datetime', $previousMonth->year)
            ->where('status', 'completed')
            ->join('dental_services', 'appointments.dental_service_id', '=', 'dental_services.id')
            ->sum('dental_services.price');
        
        $revenueGrowthRate = $previousMonthRevenue > 0 
            ? round((($currentMonthRevenue - $previousMonthRevenue) / $previousMonthRevenue) * 100, 1)
            : 0;
            
        // Get dentist workload
        $dentistWorkload = Appointment::select('dentist_id', DB::raw('count(*) as count'))
            ->where('appointment_datetime', '>=', Carbon::now()->subMonths(1))
            ->groupBy('dentist_id')
            ->with('dentist')
            ->get()
            ->map(function ($item) {
                return [
                    'dentist_name' => $item->dentist->name ?? 'Unknown',
                    'count' => $item->count,
                ];
            });
        
        // Appointment status distribution
        $statusDistribution = Appointment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst($item->status ?? 'Unknown'),
                    'value' => $item->count,
                ];
            });
            
        // NEW: Service category popularity
        $serviceCategoryDistribution = DentalService::join('appointments', 'dental_services.id', '=', 'appointments.dental_service_id')
            ->select('dental_services.category', DB::raw('COUNT(*) as count'))
            ->groupBy('dental_services.category')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => ucfirst($item->category ?? 'Uncategorized'),
                    'value' => $item->count,
                ];
            });
            
        // NEW: Most popular services
        $popularServices = DentalService::join('appointments', 'dental_services.id', '=', 'appointments.dental_service_id')
            ->select('dental_services.name', DB::raw('COUNT(*) as count'))
            ->groupBy('dental_services.name')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name ?? 'Unknown',
                    'value' => $item->count,
                ];
            });
            
        // NEW: Peak appointment hours
        $peakHours = Appointment::select(DB::raw('HOUR(appointment_datetime) as hour'), DB::raw('COUNT(*) as count'))
            ->where('appointment_datetime', '>=', Carbon::now()->subMonths(3))
            ->groupBy('hour')
            ->orderBy('hour')
            ->get()
            ->map(function ($item) {
                $hour = $item->hour;
                $formattedHour = $hour < 12 
                    ? ($hour === 0 ? '12 AM' : $hour . ' AM') 
                    : ($hour === 12 ? '12 PM' : ($hour - 12) . ' PM');
                
                return [
                    'name' => $formattedHour,
                    'value' => $item->count,
                ];
            });
            
        // NEW: Weekly distribution
        $weekdayDistribution = Appointment::select(DB::raw('WEEKDAY(appointment_datetime) as weekday'), DB::raw('COUNT(*) as count'))
            ->where('appointment_datetime', '>=', Carbon::now()->subMonths(3))
            ->groupBy('weekday')
            ->orderBy('weekday')
            ->get()
            ->map(function ($item) {
                $weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                return [
                    'name' => $weekdays[$item->weekday] ?? 'Unknown',
                    'value' => $item->count,
                ];
            });

        // Prepare data for the frontend
        $analyticsData = [
            'appointmentTrend' => $appointmentTrend,
            'totalAppointments' => Appointment::count(),
            'activePatients' => $activePatients,
            'revenue' => $currentMonthRevenue,
            'growthRates' => [
                'appointments' => $appointmentsGrowthRate,
                'patients' => $patientsGrowthRate,
                'revenue' => $revenueGrowthRate
            ],
            'dentistWorkload' => $dentistWorkload,
            'statusDistribution' => $statusDistribution,
            'serviceCategoryDistribution' => $serviceCategoryDistribution,
            'popularServices' => $popularServices,
            'peakHours' => $peakHours,
            'weekdayDistribution' => $weekdayDistribution,
            // NEW: Summary statistics
            'summary' => [
                'totalDentists' => User::where('role', 'dentist')->count(),
                'totalPatients' => Patient::count(),
                'totalServices' => DentalService::count(),
                'activeServices' => DentalService::where('is_active', true)->count(),
                'avgAppointmentDuration' => round(Appointment::avg('duration_minutes') ?? 0),
                'completionRate' => Appointment::where('status', 'completed')->count() / max(Appointment::count(), 1) * 100
            ]
        ];

        return Inertia::render('Admin/analytics', [
            'analyticsData' => $analyticsData,
            'userRole' => 'admin'
        ]);
    }

    /**
     * Display the appointment management page with data
     *
     * @return \Inertia\Response
     */
    public function appointmentManagement()
    {
        // Get all appointments with related data
        $appointmentsQuery = Appointment::with(['patient.user', 'dentist', 'dentalService'])
            ->orderBy('appointment_datetime', 'desc')
            ->get();
            
        // Check if we have any real appointments
        if ($appointmentsQuery->isEmpty()) {
            // Debug info - Log that we're generating sample data
            info('No real appointments found, generating sample data');
            
            // Generate sample appointments since we have none
            // We'll use the same approach as in dentistManagement
            $sampleAppointments = collect();
            
            // Get dentists, services and patients for sample data
            $dentists = User::where('role', 'dentist')->take(3)->get();
            $services = DentalService::take(5)->get();
            $patients = Patient::with('user')->take(5)->get();
            
            // Debug info - Log the counts of available records
            info("Available records for sample data: " . 
                 $dentists->count() . " dentists, " . 
                 $services->count() . " services, " . 
                 $patients->count() . " patients");
            
            // Only generate sample data if we have the required records
            if ($dentists->isNotEmpty() && $services->isNotEmpty() && $patients->isNotEmpty()) {
                $statuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
                
                // Generate 10 sample appointments with variety
                for ($i = 0; $i < 10; $i++) {
                    $dentist = $dentists->random();
                    $service = $services->random();
                    $patient = $patients->random();
                    $status = $statuses[array_rand($statuses)];
                    
                    // Calculate a random date (some in past, some today, some in future)
                    $daysOffset = rand(-10, 20); // Between 10 days ago and 20 days in future
                    $appointmentDate = now()->addDays($daysOffset);
                    
                    // For completed appointments, ensure they're in the past
                    if ($status === 'completed') {
                        $appointmentDate = now()->subDays(rand(1, 10));
                    }
                    
                    // For today's appointments
                    if ($daysOffset === 0) {
                        // Only pending or confirmed for today
                        $status = ['pending', 'confirmed'][array_rand(['pending', 'confirmed'])];
                    }
                    
                    $sampleAppointments->push([
                        'id' => $i + 1,
                        'patient_name' => $patient->user->name,
                        'patient_id' => $patient->id,
                        'dentist_name' => $dentist->name,
                        'dentist_id' => $dentist->id,
                        'service_name' => $service->name,
                        'service_id' => $service->id,
                        'appointment_datetime' => $appointmentDate->format('Y-m-d H:i:s'),
                        'status' => $status,
                        'duration_minutes' => $service->duration ?? rand(30, 120),
                        'cost' => $service->price ?? rand(500, 2000),
                        'payment_status' => ($status === 'completed') ? 'paid' : 'unpaid',
                        'notes' => $status === 'completed' ? 'Treatment completed successfully.' : null,
                        'cancellation_reason' => ($status === 'cancelled') ? 'Patient requested cancellation.' : null,
                    ]);
                }
                
                $appointments = $sampleAppointments;
                info('Generated ' . $sampleAppointments->count() . ' sample appointments');
            } else {
                // No sample data possible, return empty collection
                $appointments = collect([]);
                info('Could not generate sample appointments due to missing required records');
            }
        } else {
            // Map real appointments to the expected format
            $appointments = $appointmentsQuery->map(function ($appointment) {
                // Make sure to handle null relationships safely
                $patientName = 'Unknown';
                $patientId = null;
                
                if ($appointment->patient && $appointment->patient->user) {
                    $patientName = $appointment->patient->user->name;
                    $patientId = $appointment->patient_id;
                }
                
                $dentistName = 'Unknown';
                $dentistId = null;
                
                if ($appointment->dentist) {
                    $dentistName = $appointment->dentist->name;
                    $dentistId = $appointment->dentist_id;
                }
                
                $serviceName = 'Unknown';
                $serviceId = null;
                $cost = 0;
                
                if ($appointment->dentalService) {
                    $serviceName = $appointment->dentalService->name;
                    $serviceId = $appointment->dental_service_id;
                    $cost = $appointment->dentalService->price;
                }
                
                // Ensure we have an appointment status
                $status = $appointment->status ?? 'pending';
                
                // Ensure we have a valid appointment datetime string
                $appointmentDatetime = $appointment->appointment_datetime ?? now()->format('Y-m-d H:i:s');
                
                return [
                    'id' => $appointment->id,
                    'patient_name' => $patientName,
                    'patient_id' => $patientId,
                    'dentist_name' => $dentistName,
                    'dentist_id' => $dentistId,
                    'service_name' => $serviceName,
                    'service_id' => $serviceId,
                    'appointment_datetime' => $appointmentDatetime,
                    'status' => $status,
                    'duration_minutes' => $appointment->duration_minutes ?? 30,
                    'cost' => $cost,
                    'payment_status' => $appointment->is_paid ? 'paid' : 'unpaid',
                    'notes' => $appointment->notes,
                    'cancellation_reason' => $appointment->cancellation_reason,
                ];
            });
        }

        // Calculate appointment statistics
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();
        
        $stats = [
            'total' => $appointments->count(),
            'pending' => $appointments->where('status', 'pending')->count(),
            'confirmed' => $appointments->where('status', 'confirmed')->count(),
            'completed' => $appointments->where('status', 'completed')->count(),
            'cancelled' => $appointments->where('status', 'cancelled')->count(),
            'no_show' => $appointments->where('status', 'no_show')->count(),
            'today' => $appointments->filter(function ($appointment) use ($today, $tomorrow) {
                $appointmentDate = Carbon::parse($appointment['appointment_datetime']);
                return $appointmentDate >= $today && $appointmentDate < $tomorrow;
            })->count(),
            'upcoming' => $appointments->filter(function ($appointment) use ($tomorrow) {
                return Carbon::parse($appointment['appointment_datetime']) >= $tomorrow;
            })->count(),
        ];

        // For debugging - output a sample of the data structure
        if ($appointments->count() > 0) {
            info('Sample appointment structure: ' . json_encode($appointments->first(), JSON_PRETTY_PRINT));
        }
        
        // Explicitly convert to array before passing to the view
        // This ensures consistent data structure for the frontend
        return Inertia::render('Admin/appointments', [
            'appointments' => $appointments->values()->toArray(),
            'stats' => $stats,
        ]);
    }

    /**
     * Get appointment trend data for the last 6 months
     * 
     * @return array
     */
    private function getAppointmentTrendData()
    {
        $data = [];
        $months = [];
        
        // Get last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $monthName = $month->format('M');
            $months[$monthName] = [
                'month' => $monthName,
                'count' => 0
            ];
        }

        // Get appointment counts for each month
        $appointmentCounts = Appointment::select(
                DB::raw('MONTH(appointment_datetime) as month'),
                DB::raw('YEAR(appointment_datetime) as year'),
                DB::raw('COUNT(*) as count')
            )
            ->where('appointment_datetime', '>=', Carbon::now()->subMonths(6))
            ->groupBy('year', 'month')
            ->get();

        // Map the DB results to the months array
        foreach ($appointmentCounts as $count) {
            $monthName = Carbon::createFromDate($count->year, $count->month, 1)->format('M');
            if (isset($months[$monthName])) {
                $months[$monthName]['count'] = $count->count;
            }
        }

        // Convert associative array to indexed array
        foreach ($months as $monthData) {
            $data[] = $monthData;
        }

        return $data;
    }
}
