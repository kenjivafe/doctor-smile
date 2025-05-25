<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class AppointmentBookedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The appointment instance.
     *
     * @var \App\Models\Appointment
     */
    protected $appointment;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\Appointment $appointment
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
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
            ->subject('New Appointment Confirmation - Doctor Smile')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Thank you for booking an appointment with Doctor Smile Dental Clinic.')
            ->line('Your appointment details are:')
            ->line('**Date:** ' . $formattedDate)
            ->line('**Time:** ' . $formattedTime)
            ->line('**Service:** ' . ($this->appointment->dentalService->name ?? 'Dental Service'))
            ->line('**Dentist:** ' . ($this->appointment->dentist->name ?? 'Doctor'))
            ->line('**Status:** Pending approval from the dentist')
            ->line('Please note that this appointment is pending approval from the dentist. You will receive another email once the dentist confirms or suggests a different time.')
            ->action('View Appointment Details', url('/patient/appointments/' . $this->appointment->id))
            ->line('If you need to cancel or have any questions about your appointment, please visit our website or contact us directly.')
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
            'type' => 'appointment_booked',
            'appointment_datetime' => $this->appointment->appointment_datetime,
            'formatted_date' => $appointmentDate->format('Y-m-d'),
            'formatted_time' => $appointmentDate->format('H:i'),
            'service_name' => $this->appointment->dentalService->name ?? 'Dental Service',
            'dentist_name' => $this->appointment->dentist->name ?? 'Doctor',
            'status' => $this->appointment->status
        ];
    }
}
