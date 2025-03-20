<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard - accessible by all authenticated users
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Admin routes
    Route::middleware(['role.admin'])->prefix('admin')->group(function () {
        Route::get('analytics', function () {
            return Inertia::render('Admin/Analytics');
        })->name('admin.analytics');
    });

    // Dentist routes
    Route::middleware(['role.dentist'])->prefix('dentist')->group(function () {
        Route::get('appointments', function () {
            return Inertia::render('Dentist/Appointments');
        })->name('dentist.appointments');
    });

    // Patient routes
    Route::middleware(['role.patient'])->prefix('patient')->group(function () {
        Route::get('book-appointment', function () {
            return Inertia::render('Patient/BookAppointment');
        })->name('patient.book-appointment');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
