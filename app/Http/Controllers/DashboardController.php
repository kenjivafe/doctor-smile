<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
     * Admin dashboard view.
     *
     * @return \Inertia\Response
     */
    private function adminDashboard()
    {
        // Fetch data needed for admin dashboard
        $stats = [
            'totalPatients' => 0, // Replace with actual count
            'totalAppointments' => 0, // Replace with actual count
            'upcomingAppointments' => 0, // Replace with actual count
            'revenues' => 0, // Replace with actual amount
        ];

        return Inertia::render('Admin/admin-dashboard', [
            'stats' => $stats,
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
        // Fetch today's appointments for the dentist
        $todaysAppointments = [];
        $upcomingAppointments = [];

        return Inertia::render('Dentist/dentist-dashboard', [
            'todaysAppointments' => $todaysAppointments,
            'upcomingAppointments' => $upcomingAppointments,
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
        // Fetch patient's appointments and dental records
        $appointments = [];
        $nextAppointment = null;

        return Inertia::render('Patient/patient-dashboard', [
            'appointments' => $appointments,
            'nextAppointment' => $nextAppointment,
            'userRole' => 'patient',
        ]);
    }

    /**
     * Default dashboard view.
     *
     * @return \Inertia\Response
     */
    private function defaultDashboard()
    {
        return Inertia::render('Dashboard', [
            'userRole' => 'default',
        ]);
    }
}
