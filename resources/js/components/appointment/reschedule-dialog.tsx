import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DateTimeSelection } from '@/components/appointment/steps/date-time-selection';
import { useForm } from '@inertiajs/react';

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: number;
  serviceDuration?: number;
  dentistId?: number;
  serviceId?: number;
}

export function RescheduleDialog({
  isOpen,
  onClose,
  appointmentId,
  serviceDuration,
  dentistId,
  serviceId,
}: RescheduleDialogProps) {
  const { setData, post, processing, errors } = useForm({
    appointment_datetime: '',
    duration_minutes: serviceDuration || 30,
    notes: 'Rescheduled by dentist',
  });

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Update the appointment_datetime whenever date or time changes
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const appointmentDatetime = `${selectedDate} ${selectedTime}`;
      setData('appointment_datetime', appointmentDatetime);
    }
  }, [selectedDate, selectedTime, setData]);

  const handleSubmit = () => {
    if (!selectedDate || !selectedTime) {
      return; // Don't submit if date or time is not selected
    }
    
    post(route('dentist.appointments.suggest-new-time', appointmentId), {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Reschedule Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Please select a new date and time for this appointment.
          </p>
          
          <DateTimeSelection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={(date) => setSelectedDate(date)}
            onSelectTime={(time) => setSelectedTime(time)}
            dateError={errors.appointment_datetime}
            timeError={errors.appointment_datetime}
            serviceDuration={serviceDuration}
            dentistId={dentistId}
            serviceId={serviceId}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={processing || !selectedDate || !selectedTime}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
