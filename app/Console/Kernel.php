<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Send appointment reminders daily at 9 AM
        $schedule->command('appointments:send-reminders')
                 ->dailyAt('09:00')
                 ->runInBackground()
                 ->withoutOverlapping()
                 ->emailOutputOnFailure(env('MAIL_ADMIN_ADDRESS', 'admin@doctor-smile.com'));
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
