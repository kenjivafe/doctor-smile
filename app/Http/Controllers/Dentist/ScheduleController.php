<?php

namespace App\Http\Controllers\Dentist;

use App\Http\Controllers\Controller;
use App\Models\DentistBlockedDate;
use App\Models\DentistWorkingHour;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display the dentist's schedule.
     */
    public function index()
    {
        $dentistId = Auth::id();
        
        // Get working hours
        $workingHours = DentistWorkingHour::where('dentist_id', $dentistId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(function ($hour) {
                return [
                    'id' => $hour->id,
                    'day_of_week' => $hour->day_of_week,
                    'day_name' => $hour->day_name,
                    'start_time' => $hour->start_time,
                    'end_time' => $hour->end_time,
                    'is_active' => $hour->is_active,
                ];
            });
        
        // Get blocked dates (only future dates)
        $blockedDates = DentistBlockedDate::where('dentist_id', $dentistId)
            ->where('blocked_date', '>=', Carbon::today())
            ->orderBy('blocked_date')
            ->get()
            ->map(function ($date) {
                return [
                    'id' => $date->id,
                    'blocked_date' => $date->blocked_date->format('Y-m-d'),
                    'start_time' => $date->start_time,
                    'end_time' => $date->end_time,
                    'reason' => $date->reason,
                    'is_full_day' => !$date->start_time && !$date->end_time,
                ];
            });
        
        return Inertia::render('Dentist/schedule', [
            'workingHours' => $workingHours,
            'blockedDates' => $blockedDates,
        ]);
    }
    
    /**
     * Store a new working hour.
     */
    public function storeWorkingHour(Request $request)
    {
        $dentistId = Auth::id();
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Create the working hour
        DentistWorkingHour::create([
            'dentist_id' => $dentistId,
            'day_of_week' => $request->day_of_week,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'is_active' => true,
        ]);
        
        return redirect()->route('dentist.schedule')
            ->with('success', 'Working hour added successfully.');
    }
    
    /**
     * Update a working hour.
     */
    public function updateWorkingHour(Request $request, int $id)
    {
        $dentistId = Auth::id();
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'required|boolean',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Find the working hour and ensure it belongs to the current dentist
        $workingHour = DentistWorkingHour::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
        
        // Update the working hour
        $workingHour->update([
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'is_active' => $request->is_active,
        ]);
        
        return redirect()->route('dentist.schedule')
            ->with('success', 'Working hour updated successfully.');
    }
    
    /**
     * Delete a working hour.
     */
    public function deleteWorkingHour(int $id)
    {
        $dentistId = Auth::id();
        
        // Find the working hour and ensure it belongs to the current dentist
        $workingHour = DentistWorkingHour::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
        
        // Delete the working hour
        $workingHour->delete();
        
        return redirect()->route('dentist.schedule')
            ->with('success', 'Working hour deleted successfully.');
    }
    
    /**
     * Store a new blocked date.
     */
    public function storeBlockedDate(Request $request)
    {
        $dentistId = Auth::id();
        
        // Validate the request
        $validator = Validator::make($request->all(), [
            'blocked_date' => 'required|date|after_or_equal:today',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'reason' => 'nullable|string|max:255',
        ]);
        
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }
        
        // Create the blocked date
        DentistBlockedDate::create([
            'dentist_id' => $dentistId,
            'blocked_date' => $request->blocked_date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'reason' => $request->reason,
        ]);
        
        return redirect()->route('dentist.schedule')
            ->with('success', 'Date blocked successfully.');
    }
    
    /**
     * Delete a blocked date.
     */
    public function deleteBlockedDate(int $id)
    {
        $dentistId = Auth::id();
        
        // Find the blocked date and ensure it belongs to the current dentist
        $blockedDate = DentistBlockedDate::where('dentist_id', $dentistId)
            ->where('id', $id)
            ->firstOrFail();
        
        // Delete the blocked date
        $blockedDate->delete();
        
        return redirect()->route('dentist.schedule')
            ->with('success', 'Blocked date removed successfully.');
    }
}
