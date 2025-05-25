<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\AppointmentReminderNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send email reminders for upcoming appointments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sending appointment reminders...');
        
        // Get appointments scheduled for tomorrow
        $tomorrow = Carbon::tomorrow();
        $startOfDay = $tomorrow->copy()->startOfDay();
        $endOfDay = $tomorrow->copy()->endOfDay();
        
        $this->info("Checking appointments between {$startOfDay->toDateTimeString()} and {$endOfDay->toDateTimeString()}");
        
        // Find confirmed appointments for tomorrow
        $appointments = Appointment::with(['patient.user', 'dentist', 'dentalService'])
            ->whereBetween('appointment_datetime', [$startOfDay, $endOfDay])
            ->where('status', 'confirmed')
            ->get();
            
        $this->info("Found {$appointments->count()} appointments requiring reminders");
        
        $reminderCount = 0;
        
        foreach ($appointments as $appointment) {
            try {
                // Make sure we have valid relationships
                if (!$appointment->patient || !$appointment->patient->user) {
                    Log::warning('Appointment has missing patient relationship', [
                        'appointment_id' => $appointment->id
                    ]);
                    continue;
                }
                
                // Send reminder to patient
                $appointment->patient->user->notify(new AppointmentReminderNotification($appointment));
                
                // Also send to dentist
                if ($appointment->dentist) {
                    $appointment->dentist->notify(new AppointmentReminderNotification($appointment));
                }
                
                $reminderCount++;
                
                $this->info("Sent reminder for appointment #{$appointment->id} scheduled at {$appointment->appointment_datetime}");
                
                // Small delay to prevent email throttling
                usleep(100000); // 100ms delay
                
            } catch (\Exception $e) {
                $this->error("Error sending reminder for appointment #{$appointment->id}: {$e->getMessage()}");
                Log::error('Failed to send appointment reminder', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }
        
        $this->info("Successfully sent {$reminderCount} appointment reminders");
        
        return 0;
    }
}
