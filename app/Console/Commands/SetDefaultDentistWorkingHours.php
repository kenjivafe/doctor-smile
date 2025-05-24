<?php

namespace App\Console\Commands;

use App\Services\DentistWorkingHourService;
use Illuminate\Console\Command;

class SetDefaultDentistWorkingHours extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dentist:set-default-working-hours {--dentist-id= : The ID of a specific dentist to set default working hours for}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set default working hours for all dentists or a specific dentist';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dentistId = $this->option('dentist-id');

        if ($dentistId) {
            // Set default working hours for a specific dentist
            DentistWorkingHourService::createDefaultWorkingHours($dentistId);
            $this->info("Default working hours have been set for dentist with ID: {$dentistId}");
        } else {
            // Set default working hours for all dentists
            DentistWorkingHourService::createDefaultWorkingHoursForAllDentists();
            $this->info('Default working hours have been set for all dentists');
        }

        return Command::SUCCESS;
    }
}
