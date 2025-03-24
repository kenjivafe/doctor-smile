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

class AdminController extends Controller
{
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
            'statusDistribution' => $statusDistribution
        ];

        return Inertia::render('Admin/analytics', [
            'analyticsData' => $analyticsData,
            'userRole' => 'admin'
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
