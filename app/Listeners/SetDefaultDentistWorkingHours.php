<?php

namespace App\Listeners;

use App\Services\DentistWorkingHourService;
use Illuminate\Auth\Events\Registered;

class SetDefaultDentistWorkingHours
{
    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;

        // Only set default working hours for dentist users
        if ($user->role === 'dentist') {
            DentistWorkingHourService::createDefaultWorkingHours($user->id);
        }
    }
}
