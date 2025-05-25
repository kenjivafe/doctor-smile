import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { 
  CalendarClock, 
  Clock, 
  Stethoscope, 
  CreditCard, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import React from 'react';

interface Appointment {
  id: number;
  dentist_name: string;
  service_name: string;
  appointment_datetime: string;
  status: 'pending' | 'suggested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  duration_minutes: number;
  cost: string;
  notes?: string;
  treatment_notes?: string;
  cancellation_reason?: string;
}

interface AppointmentDetailsProps {
  appointment: Appointment;
}

// Function to get the appropriate badge variant based on appointment status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'default'; // Primary color
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'suggested':
      return 'warning';
    case 'no_show':
      return 'destructive';
    case 'pending':
    default:
      return 'outline';
  }
};

// Function to format the status text for display
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function AppointmentDetails() {
  const { appointment } = usePage().props as unknown as AppointmentDetailsProps;
  
  // State for cancellation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancellationReason, setCancellationReason] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Function to handle opening the cancel dialog
  const openCancelDialog = () => {
    setCancelDialogOpen(true);
  };
  
  // Function to handle cancellation submission
  const handleCancelAppointment = () => {
    setIsLoading(true);
    
    router.post(`/patient/appointments/${appointment.id}/cancel`, {
      cancellation_reason: cancellationReason || 'Cancelled by patient'
    }, {
      onSuccess: () => {
        setIsLoading(false);
        setCancelDialogOpen(false);
        // Refresh the page to update the appointment status
        window.location.reload();
      },
      onError: (error) => {
        console.error('Error cancelling appointment:', error);
        setIsLoading(false);
      },
    });
  };
  
  // Generate breadcrumbs with the current appointment
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Appointments',
      href: '/patient/appointments',
    },
    {
      title: `Appointment #${appointment.id}`,
      href: `/patient/appointments/${appointment.id}`,
    },
  ];

  // Format the appointment date and time for display
  const formatAppointmentDateTime = () => {
    const date = format(new Date(appointment.appointment_datetime), 'MMMM d, yyyy');
    
    // Format time to be more user-friendly
    const timePart = appointment.appointment_datetime.split('T')[1].substring(0, 5);
    const [hours, minutes] = timePart.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const time = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    
    return { date, time };
  };
  
  const { date, time } = formatAppointmentDateTime();

  return (
    <>
      <Head title={`Appointment Details #${appointment.id}`} />
      <PageTemplate title="Appointment Details" breadcrumbs={breadcrumbs}>
        <div className="mb-4">
          <Link 
            href="/patient/appointments" 
            variant="outline" 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>
        </div>
        
        <Card className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{appointment.service_name}</h2>
              <div className="mt-2">
                <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm">
                  {formatStatus(appointment.status)}
                </Badge>
              </div>
            </div>
            
            {/* Action buttons based on appointment status */}
            <div className="mt-4 md:mt-0">
              {appointment.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    variant="destructive"
                    className="gap-2"
                    onClick={openCancelDialog}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Cancel Appointment
                  </Button>
                </div>
              )}
              
              {appointment.status === 'suggested' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link 
                    href={`/patient/appointments/${appointment.id}/confirm-suggestion`}
                    method="post"
                    as="button"
                    variant="default"
                    className="gap-2"
                  >
                    <CalendarClock className="h-4 w-4" />
                    Accept New Time
                  </Link>
                  <Link 
                    href={`/patient/appointments/${appointment.id}/decline-suggestion`}
                    method="post"
                    as="button"
                    variant="destructive"
                    className="gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Decline New Time
                  </Link>
                </div>
              )}
              
              {appointment.status === 'confirmed' && (
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm px-3 py-1 mr-2">
                    {formatStatus(appointment.status)}
                  </Badge>
                  <Button 
                    variant="destructive"
                    className="gap-2"
                    onClick={openCancelDialog}
                  >
                    <AlertCircle className="h-4 w-4" />
                    Cancel Appointment
                  </Button>
                </div>
              )}
              
              {appointment.status === 'completed' && (
                <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm px-3 py-1">
                  {formatStatus(appointment.status)}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Appointment Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CalendarClock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">{date}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-muted-foreground">{time} ({appointment.duration_minutes} minutes)</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Stethoscope className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Dentist</p>
                  <p className="text-muted-foreground">{appointment.dentist_name}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Cost</p>
                  <p className="text-muted-foreground">₱{appointment.cost}</p>
                </div>
              </div>
              
              {appointment.status === 'cancelled' && appointment.cancellation_reason && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium">Cancellation Reason</p>
                    <p className="text-muted-foreground">{appointment.cancellation_reason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Notes Section */}
          {(appointment.notes || appointment.treatment_notes) && (
            <>
              <Separator className="my-6" />
              <div className="space-y-6">
                {appointment.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{appointment.notes}</p>
                  </div>
                )}
                
                {appointment.treatment_notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Treatment Notes</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{appointment.treatment_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      </PageTemplate>
      
      {/* Cancellation Dialog */}
      <Dialog 
        open={cancelDialogOpen} 
        onOpenChange={(open) => {
          if (open) {
            setCancelDialogOpen(open);
          } else {
            // Force a full page reload when dialog is closed without confirmation
            window.location.reload();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              <div className="mt-2 text-sm">
                <p><strong>Dentist:</strong> {appointment.dentist_name}</p>
                <p><strong>Service:</strong> {appointment.service_name}</p>
                <p><strong>Date/Time:</strong> {format(new Date(appointment.appointment_datetime), 'MMM d, yyyy')} at {format(new Date(appointment.appointment_datetime), 'h:mm a')}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="cancellation-reason" className="text-sm font-medium">
              Cancellation Reason <span className="text-muted-foreground">(will be shared with the dentist)</span>
            </Label>
            <Textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              className="mt-1.5"
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
