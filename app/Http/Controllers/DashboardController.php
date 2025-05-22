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
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the appropriate dashboard based on user role.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = Auth::user();
        $role = $user->role;

        switch ($role) {
            case 'admin':
                return $this->adminDashboard();
            case 'dentist':
                return $this->dentistDashboard();
            case 'patient':
                return $this->patientDashboard();
            default:
                return $this->defaultDashboard();
        }
    }

    /**
     * Admin dashboard view with comprehensive analytics.
     *
     * @return \Inertia\Response
     */
    private function adminDashboard()
    {
        // Basic stats for the dashboard cards
        $stats = [
            'totalPatients' => Patient::count(),
            'totalAppointments' => Appointment::count(),
            'upcomingAppointments' => Appointment::whereIn('status', ['scheduled', 'confirmed'])
                ->where('appointment_datetime', '>=', Carbon::now())
                ->count(),
            'revenues' => Appointment::where('status', 'completed')
                ->join('dental_services', 'appointments.dental_service_id', '=', 'dental_services.id')
                ->sum('dental_services.price'),
        ];

        // Recent appointments
        $recentAppointments = Appointment::with(['patient.user', 'dentist', 'dentalService'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Appointment status distribution
        $statusDistribution = Appointment::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Dentist workload
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

        return Inertia::render('Admin/admin-dashboard', [
            'stats' => $stats,
            'recentAppointments' => $recentAppointments,
            'statusDistribution' => $statusDistribution,
            'dentistWorkload' => $dentistWorkload,
            'userRole' => 'admin',
        ]);
    }

    /**
     * Dentist dashboard view.
     *
     * @return \Inertia\Response
     */
    private function dentistDashboard()
    {
        $dentistId = Auth::id();
        $today = Carbon::now()->format('Y-m-d');

        // Fetch today's appointments for the dentist
        $todaysAppointments = Appointment::with(['patient.user', 'dentalService'])
            ->where('dentist_id', $dentistId)
            ->whereDate('appointment_datetime', $today)
            ->orderBy('appointment_datetime')
            ->get();

        // Fetch upcoming appointments
        $upcomingAppointments = Appointment::with(['patient.user', 'dentalService'])
            ->where('dentist_id', $dentistId)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where('appointment_datetime', '>', Carbon::now())
            ->orderBy('appointment_datetime')
            ->limit(10)
            ->get();

        // Next 7 days for appointment scheduling
        $nextSevenDays = [];
        for ($i = 0; $i < 7; $i++) {
            $date = Carbon::now()->addDays($i);
            $nextSevenDays[] = [
                'date' => $date->format('Y-m-d'),
                'day_name' => $date->format('l'),
                'formatted_date' => $date->format('M d, Y'),
            ];
        }

        // Appointment counts by status
        $appointmentCounts = Appointment::select('status', DB::raw('count(*) as count'))
            ->where('dentist_id', $dentistId)
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return Inertia::render('Dentist/dentist-dashboard', [
            'todaysAppointments' => $todaysAppointments,
            'upcomingAppointments' => $upcomingAppointments,
            'nextSevenDays' => $nextSevenDays,
            'appointmentCounts' => $appointmentCounts,
            'userRole' => 'dentist',
        ]);
    }

    /**
     * Patient dashboard view.
     *
     * @return \Inertia\Response
     */
    private function patientDashboard()
    {
        $user = Auth::user();
        $patient = Patient::where('user_id', $user->id)->first();

        // If no patient record exists for this user, create a temporary one for display purposes
        // and show a warning message
        $missingPatientRecord = false;
        if (!$patient) {
            $missingPatientRecord = true;
            $patient = new Patient();
            $patient->user_id = $user->id;
            // Populate with minimal data needed for display
        }

        // Fetch patient's appointments
        $appointments = $missingPatientRecord ? [] : Appointment::with(['dentist', 'dentalService'])
            ->where('patient_id', $patient->id)
            ->orderBy('appointment_datetime', 'desc')
            ->get();

        // Fetch next upcoming appointment
        $nextAppointment = $missingPatientRecord ? null : Appointment::with(['dentist', 'dentalService'])
            ->where('patient_id', $patient->id)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->where('appointment_datetime', '>', Carbon::now())
            ->orderBy('appointment_datetime')
            ->first();

        // Fetch dental services for potential new appointments
        $dentalServices = DentalService::where('is_active', true)
            ->orderBy('name')
            ->get();

        // Patient details including medical history
        $patientDetails = $missingPatientRecord 
            ? [
                'name' => $user->name, 
                'email' => $user->email,
                'phone_number' => '',
                'address' => '',
                'date_of_birth' => '',
                'gender' => '',
            ] 
            : array_merge(
                $patient->toArray(), 
                [
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            );

        return Inertia::render('Patient/patient-dashboard', [
            'appointments' => $appointments,
            'nextAppointment' => $nextAppointment,
            'dentalServices' => $dentalServices,
            'patientDetails' => $patientDetails,
            'userRole' => 'patient',
            'missingPatientRecord' => $missingPatientRecord,
        ]);
    }

    /**
     * Default dashboard view.
     *
     * @return \Inertia\Response
     */
    private function defaultDashboard()
    {
        return Inertia::render('dashboard', [
            'userRole' => 'default',
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
