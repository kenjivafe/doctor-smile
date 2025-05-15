import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BookingSummaryProps {
  appointmentData: {
    dental_service_id?: number;
    dentist_id?: number;
    appointment_date?: string;
    appointment_time?: string;
    notes?: string;
  };
  services?: Array<{
    id: number;
    name: string;
    price: string;
    duration_minutes: number;
  }>;
  dentists?: Array<{
    id: number;
    name: string;
  }>;
  onNotesChange: (notes: string) => void;
  error?: string;
}

export default function BookingSummary({
  appointmentData,
  services = [],
  dentists = [],
  onNotesChange,
  error,
}: BookingSummaryProps) {
  const selectedService = services.find(
    (service) => service.id === appointmentData.dental_service_id
  );
  
  const selectedDentist = dentists.find(
    (dentist) => dentist.id === appointmentData.dentist_id
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Review & Confirm</h2>
        <p className="text-muted-foreground mb-6">
          Please review your appointment details before confirming
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Appointment Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">{selectedService?.name || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>{selectedService?.duration_minutes || 'N/A'} minutes</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">₱{selectedService?.price || 'N/A'}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dentist:</span>
            <span>{selectedDentist?.name || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date:</span>
            <span>{formatDate(appointmentData.appointment_date)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span>{appointmentData.appointment_time || 'N/A'}</span>
          </div>
        </div>
      </Card>

      <div>
        <label className="block text-sm font-medium mb-2">
          Additional Notes (optional)
        </label>
        <Textarea
          placeholder="Any details you'd like to share with the dentist..."
          value={appointmentData.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="min-h-32"
        />
        {error && (
          <div className="text-sm font-medium text-destructive mt-1">
            {error}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-md text-sm">
        <p className="font-medium text-blue-700 dark:text-blue-400 mb-2">
          What happens next?
        </p>
        <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
          <li>Your appointment request will be sent to the dentist</li>
          <li>The dentist will approve, suggest a new time, or reject the appointment</li>
          <li>You'll receive a notification about the dentist's decision</li>
          <li>You'll need to confirm or cancel if the dentist suggests a new time</li>
        </ul>
      </div>
    </div>
  );
}
