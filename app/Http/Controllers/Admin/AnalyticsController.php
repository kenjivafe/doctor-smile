<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Dentist;
use App\Models\DentalService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index()
    {
        $now = now();
        $oneYearAgo = now()->subYear();
        
        // Appointment trends (last 12 months)
        $appointmentTrends = Appointment::selectRaw('DATE_FORMAT(appointment_datetime, "%Y-%m") as month, COUNT(*) as count')
            ->where('appointment_datetime', '>=', $oneYearAgo)
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                    'count' => $item->count
                ];
            });

        // Status distribution
        $statusDistribution = Appointment::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function($item) {
                return [
                    'name' => ucfirst($item->status),
                    'value' => $item->count
                ];
            });

        // Service category distribution
        $serviceCategoryDistribution = DentalService::withCount('appointments')
            ->orderBy('appointments_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($service) {
                return [
                    'name' => $service->name,
                    'value' => $service->appointments_count
                ];
            });

        // Peak hours (group by hour of day)
        $peakHours = Appointment::selectRaw('HOUR(appointment_datetime) as hour, COUNT(*) as count')
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($item) {
                return [
                    'name' => date('g A', mktime($item->hour, 0, 0, 1, 1, 2000)),
                    'value' => $item->count
                ];
            });

        // Weekday distribution
        $weekdayDistribution = Appointment::selectRaw('DAYOFWEEK(appointment_datetime) as day, COUNT(*) as count')
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(function($item) {
                $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return [
                    'name' => $dayNames[$item->day - 1],
                    'value' => $item->count
                ];
            });

        // Summary statistics
        $summary = [
            'totalAppointments' => Appointment::count(),
            'activePatients' => Patient::has('appointments')->count(),
            'totalDentists' => Dentist::count(),
            'totalServices' => DentalService::count(),
            'completionRate' => Appointment::where('status', 'completed')->count() / 
                               max(Appointment::whereIn('status', ['completed', 'cancelled'])->count(), 1) * 100,
        ];

        // Dentist workload
        $dentistWorkload = Dentist::withCount(['appointments' => function($query) {
                $query->where('status', 'completed');
            }])
            ->orderBy('appointments_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function($dentist) {
                return [
                    'dentist_name' => $dentist->user->name,
                    'count' => $dentist->appointments_count
                ];
            });

        return Inertia::render('Admin/analytics', [
            'analyticsData' => [
                'appointmentTrend' => $appointmentTrends,
                'statusDistribution' => $statusDistribution,
                'serviceCategoryDistribution' => $serviceCategoryDistribution,
                'peakHours' => $peakHours,
                'weekdayDistribution' => $weekdayDistribution,
                'dentistWorkload' => $dentistWorkload,
                'summary' => $summary,
            ]
        ]);
    }
}
