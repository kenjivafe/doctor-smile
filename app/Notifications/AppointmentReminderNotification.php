<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class AppointmentReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The appointment instance.
     *
     * @var \App\Models\Appointment
     */
    protected $appointment;

    /**
     * How many hours before the appointment to send this reminder.
     *
     * @var int
     */
    protected $hoursBeforeAppointment;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\Appointment $appointment
     * @param int $hoursBeforeAppointment
     */
    public function __construct(Appointment $appointment, int $hoursBeforeAppointment = 24)
    {
        $this->appointment = $appointment;
        $this->hoursBeforeAppointment = $hoursBeforeAppointment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $appointmentDate = Carbon::parse($this->appointment->appointment_datetime);
        $formattedDate = $appointmentDate->format('l, F j, Y'); // e.g., Monday, January 1, 2025
        $formattedTime = $appointmentDate->format('g:i A'); // e.g., 10:00 AM
        
        return (new MailMessage)
            ->subject('Appointment Reminder - Doctor Smile')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("This is a friendly reminder about your upcoming dental appointment.")
            ->line('Your appointment is scheduled for **tomorrow**.')
            ->line('**Appointment Details:**')
            ->line('**Date:** ' . $formattedDate)
            ->line('**Time:** ' . $formattedTime)
            ->line('**Service:** ' . ($this->appointment->dentalService->name ?? 'Dental Service'))
            ->line('**Dentist:** ' . ($this->appointment->dentist->name ?? 'Doctor'))
            ->action('View Appointment Details', url('/patient/appointments/' . $this->appointment->id))
            ->line('Please arrive 10 minutes before your scheduled appointment time.')
            ->line('If you need to cancel or reschedule, please do so at least 24 hours in advance.')
            ->line('Thank you for choosing Doctor Smile for your dental care needs!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $appointmentDate = Carbon::parse($this->appointment->appointment_datetime);
        
        return [
            'id' => $this->appointment->id,
            'type' => 'appointment_reminder',
            'appointment_datetime' => $this->appointment->appointment_datetime,
            'formatted_date' => $appointmentDate->format('Y-m-d'),
            'formatted_time' => $appointmentDate->format('H:i'),
            'service_name' => $this->appointment->dentalService->name ?? 'Dental Service',
            'dentist_name' => $this->appointment->dentist->name ?? 'Doctor',
            'hours_before' => $this->hoursBeforeAppointment
        ];
    }
}
