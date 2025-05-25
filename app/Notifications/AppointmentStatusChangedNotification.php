<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;

class AppointmentStatusChangedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The appointment instance.
     *
     * @var \App\Models\Appointment
     */
    protected $appointment;

    /**
     * The old status before the change.
     *
     * @var string
     */
    protected $oldStatus;

    /**
     * Any additional notes for this status change.
     *
     * @var string|null
     */
    protected $notes;

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\Appointment $appointment
     * @param string $oldStatus
     * @param string|null $notes
     */
    public function __construct(Appointment $appointment, string $oldStatus, ?string $notes = null)
    {
        $this->appointment = $appointment;
        $this->oldStatus = $oldStatus;
        $this->notes = $notes;
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
        $viewUrl = '/patient/appointments/' . $this->appointment->id;
        
        // Determine if recipient is dentist or patient
        $recipientIsDentist = $notifiable->role === 'dentist';
        
        if ($recipientIsDentist) {
            $viewUrl = '/dentist/appointments/' . $this->appointment->id;
        }
        
        // Create the mail message
        $mail = (new MailMessage)
            ->subject($this->getSubject())
            ->greeting('Hello ' . $notifiable->name . ',');
        
        // Add status-specific messaging
        switch ($this->appointment->status) {
            case 'confirmed':
                $mail->line('An appointment has been **confirmed**.')
                    ->line('The appointment has been approved and is now confirmed.');
                break;
                
            case 'suggested':
                $mail->line('An appointment time has been **suggested**.')
                    ->line('The dentist has suggested a new time for your appointment. Please review and confirm or decline this suggested time.');
                break;
                
            case 'cancelled':
                $mail->line('An appointment has been **cancelled**.')
                    ->line('The appointment has been cancelled and is no longer scheduled.');
                break;
                
            case 'rejected':
                $mail->line('An appointment has been **rejected**.')
                    ->line('Unfortunately, the requested appointment time could not be accommodated.');
                break;
                
            case 'completed':
                $mail->line('An appointment has been marked as **completed**.')
                    ->line('Thank you for visiting Doctor Smile Dental Clinic!');
                break;
                
            default:
                $mail->line('Your appointment status has been updated.')
                    ->line('There has been a change to your appointment status.');
        }
        
        // Add the notes if available
        if ($this->notes) {
            $mail->line('**Additional Notes:** ' . $this->notes);
        }
        
        // Add appointment details
        $mail->line('**Appointment Details:**')
            ->line('**Date:** ' . $formattedDate)
            ->line('**Time:** ' . $formattedTime)
            ->line('**Service:** ' . ($this->appointment->dentalService->name ?? 'Dental Service'))
            ->line('**Status:** ' . ucfirst($this->appointment->status))
            ->action('View Appointment Details', url($viewUrl))
            ->line('If you have any questions, please contact us.');
            
        return $mail;
    }
    
    /**
     * Get appropriate subject line based on appointment status.
     *
     * @return string
     */
    protected function getSubject(): string
    {
        $status = ucfirst($this->appointment->status);
        
        switch ($this->appointment->status) {
            case 'confirmed':
                return 'Appointment Confirmed - Doctor Smile';
            case 'suggested':
                return 'New Time Suggested for Your Appointment - Doctor Smile';
            case 'cancelled':
                return 'Appointment Cancelled - Doctor Smile';
            case 'rejected':
                return 'Appointment Request Could Not Be Accommodated - Doctor Smile';
            case 'completed':
                return 'Appointment Completed - Doctor Smile';
            default:
                return 'Appointment Status Updated - Doctor Smile';
        }
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
            'type' => 'appointment_status_changed',
            'appointment_datetime' => $this->appointment->appointment_datetime,
            'formatted_date' => $appointmentDate->format('Y-m-d'),
            'formatted_time' => $appointmentDate->format('H:i'),
            'service_name' => $this->appointment->dentalService->name ?? 'Dental Service',
            'dentist_name' => $this->appointment->dentist->name ?? 'Doctor',
            'old_status' => $this->oldStatus,
            'new_status' => $this->appointment->status,
            'notes' => $this->notes
        ];
    }
}
