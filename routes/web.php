<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\DashboardController;
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

        Route::get('appointments', function () {
            return Inertia::render('Dentist/appointments');
        })->name('dentist.appointments');

        Route::get('schedule', function () {
            return Inertia::render('Dentist/schedule');
        })->name('dentist.schedule');

        Route::get('patients', function () {
            return Inertia::render('Dentist/patients');
        })->name('dentist.patients');

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

        Route::get('book-appointment', function () {
            return Inertia::render('Patient/book-appointment');
        })->name('patient.book-appointment');

        Route::get('appointments', function () {
            return Inertia::render('Patient/appointments');
        })->name('patient.appointments');

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
