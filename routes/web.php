<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Patient\AppointmentController as PatientAppointmentController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\DentistMiddleware;
use App\Http\Middleware\PatientMiddleware;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Dashboard - accessible by all authenticated users
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin routes
    Route::middleware([AdminMiddleware::class])->prefix('admin')->group(function () {
        Route::get('dashboard', function () {
            return app(DashboardController::class)->index();
        })->name('admin.dashboard');

        Route::get('users', function () {
            return Inertia::render('Admin/users');
        })->name('admin.users');

        Route::get('dentists', function () {
            return Inertia::render('Admin/dentists');
        })->name('admin.dentists');

        Route::get('patients', function () {
            return Inertia::render('Admin/patients');
        })->name('admin.patients');

        Route::get('appointments', function () {
            return Inertia::render('Admin/appointments');
        })->name('admin.appointments');

        Route::get('analytics', function () {
            return Inertia::render('Admin/analytics');
        })->name('admin.analytics');

        // Redirect to Laravel's built-in profile page for admin settings
        Route::get('settings', function () {
            return redirect()->route('profile.edit');
        })->name('admin.settings');
    });

    // Dentist routes
    Route::middleware([DentistMiddleware::class])->prefix('dentist')->group(function () {
        Route::get('dashboard', function () {
            return app(DashboardController::class)->index();
        })->name('dentist.dashboard');

        // Appointment routes
        Route::controller(\App\Http\Controllers\Dentist\AppointmentController::class)->group(function () {
            Route::get('appointments', 'index')->name('dentist.appointments');
            Route::get('appointments/{id}', 'show')->name('dentist.appointments.show');
            Route::post('appointments/{id}/update-status', 'updateStatus')->name('dentist.appointments.update-status');
            Route::post('appointments/{id}/update-notes', 'updateNotes')->name('dentist.appointments.update-notes');
            
            // Direct action routes
            Route::get('appointments/{id}/confirm', 'confirm')->name('dentist.appointments.confirm');
            Route::get('appointments/{id}/complete', 'complete')->name('dentist.appointments.complete');
            Route::get('appointments/{id}/cancel', 'cancel')->name('dentist.appointments.cancel');
            
            // API endpoint for available time slots
            Route::get('api/available-slots', [\App\Http\Controllers\Patient\AppointmentController::class, 'getAvailableTimeSlots'])->name('dentist.api.available-slots');
            
            // Form view routes
            Route::get('appointments/{id}/reschedule', function ($id) {
                $dentistId = \Illuminate\Support\Facades\Auth::id();
                
                // Find the appointment and ensure it belongs to the current dentist
                $appointment = \App\Models\Appointment::with(['patient.user', 'dentalService'])
                    ->where('dentist_id', $dentistId)
                    ->where('id', $id)
                    ->firstOrFail();
                
                // Format the appointment data for the frontend
                $appointmentData = [
                    'id' => $appointment->id,
                    'patient_name' => $appointment->patient->user->name ?? 'Unknown',
                    'service_name' => $appointment->dentalService->name ?? 'Unknown',
                    'dental_service_id' => $appointment->dental_service_id,
                    'appointment_datetime' => $appointment->appointment_datetime,
                    'status' => $appointment->status,
                    'duration_minutes' => $appointment->duration_minutes,
                ];
                
                return Inertia::render('Dentist/reschedule-appointment', [
                    'id' => $id,
                    'appointment' => $appointmentData
                ]);
            })->name('dentist.appointments.reschedule');
            
            Route::post('appointments/{id}/suggest-new-time', 'suggestNewTime')->name('dentist.appointments.suggest-new-time');
        });

        // Schedule routes
        Route::controller(\App\Http\Controllers\Dentist\ScheduleController::class)->group(function () {
            Route::get('schedule', 'index')->name('dentist.schedule');
            Route::post('schedule/working-hours', 'storeWorkingHour')->name('dentist.schedule.store-working-hour');
            Route::put('schedule/working-hours/{id}', 'updateWorkingHour')->name('dentist.schedule.update-working-hour');
            Route::delete('schedule/working-hours/{id}', 'deleteWorkingHour')->name('dentist.schedule.delete-working-hour');
            Route::post('schedule/blocked-dates', 'storeBlockedDate')->name('dentist.schedule.store-blocked-date');
            Route::delete('schedule/blocked-dates/{id}', 'deleteBlockedDate')->name('dentist.schedule.delete-blocked-date');
        });

        // Patient routes
        Route::controller(\App\Http\Controllers\Dentist\PatientController::class)->group(function () {
            Route::get('patients', 'index')->name('dentist.patients');
            Route::get('patients/{id}', 'show')->name('dentist.patients.show');
            Route::post('patients/{id}/update-next-appointment', 'updateNextAppointment')->name('dentist.patients.update-next-appointment');
            Route::post('patients/{id}/update-medical-notes', 'updateMedicalNotes')->name('dentist.patients.update-medical-notes');
            Route::post('patients/{id}/update-balance', 'updateBalance')->name('dentist.patients.update-balance');
        });

        Route::get('records', function () {
            return Inertia::render('Dentist/records');
        })->name('dentist.records');

        // Redirect to Laravel's built-in profile page for dentist settings
        Route::get('settings', function () {
            return redirect()->route('profile.edit');
        })->name('dentist.settings');
    });

    // Patient routes
    Route::middleware([PatientMiddleware::class])->prefix('patient')->group(function () {
        Route::get('dashboard', function () {
            return app(DashboardController::class)->index();
        })->name('patient.dashboard');

        // Appointment routes
        Route::get('book-appointment', [PatientAppointmentController::class, 'create'])->name('patient.book-appointment');
        Route::post('appointments', [PatientAppointmentController::class, 'store'])->name('patient.appointments.store');
        Route::get('appointments', [PatientAppointmentController::class, 'index'])->name('patient.appointments');
        Route::get('appointments/{id}', [PatientAppointmentController::class, 'show'])->name('patient.appointments.show');
        Route::post('appointments/{id}/cancel', [PatientAppointmentController::class, 'cancel'])->name('patient.appointments.cancel');
        
        // Suggested appointment response routes
        Route::post('appointments/{id}/confirm-suggestion', [PatientAppointmentController::class, 'confirmSuggestion'])->name('patient.appointments.confirm-suggestion');
        Route::post('appointments/{id}/decline-suggestion', [PatientAppointmentController::class, 'declineSuggestion'])->name('patient.appointments.decline-suggestion');
        
        // API endpoint for available time slots
        Route::get('api/available-slots', [PatientAppointmentController::class, 'getAvailableTimeSlots'])->name('api.available-slots');

        Route::get('records', function () {
            return Inertia::render('Patient/records');
        })->name('patient.records');

        Route::get('payments', function () {
            return Inertia::render('Patient/payments');
        })->name('patient.payments');

        // Redirect to Laravel's built-in profile page for patient profile
        Route::get('profile', function () {
            return redirect()->route('profile.edit');
        })->name('patient.profile');
    });

    // Help & Support route (accessible by all users)
    Route::get('help', function () {
        return Inertia::render('help');
    })->name('help');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
