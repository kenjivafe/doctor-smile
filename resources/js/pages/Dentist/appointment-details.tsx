import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
  CalendarClock,
  Clock,
  User,
  Mail,
  Phone,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface Appointment {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  service_name: string;
  appointment_datetime: string;
  status: 'pending' | 'suggested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  duration_minutes: number;
  cost: string;
  notes?: string;
  treatment_notes?: string;
  cancellation_reason?: string;
  is_paid?: boolean;
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
  const [isEditing, setIsEditing] = useState(false);

  // State for cancellation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPaidLoading, setIsPaidLoading] = useState(false);

  const form = useForm({
    treatment_notes: appointment.treatment_notes || '',
  });

  // Function to handle opening the cancel dialog
  const openCancelDialog = () => {
    setCancelDialogOpen(true);
  };

  // Function to handle cancellation submission
  const handleCancelAppointment = () => {
    setIsLoading(true);

    router.post(`/dentist/appointments/${appointment.id}/cancel`, {
      cancellation_reason: cancellationReason || 'Cancelled by dentist'
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
      href: '/dentist/appointments',
    },
    {
      title: `Appointment #${appointment.id}`,
      href: `/dentist/appointments/${appointment.id}`,
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

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    form.post(`/dentist/appointments/${appointment.id}/update-notes`, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  return (
    <>
      <Head title={`Appointment Details #${appointment.id}`} />
      <PageTemplate title="Appointment Details" breadcrumbs={breadcrumbs}>

        <Card className="p-6">
          <div className="flex flex-col justify-between mb-6 md:flex-row">
            <div>
              <h2 className="text-2xl font-bold">{appointment.service_name}</h2>
              <div className="mt-2">
                <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-sm">
                  {formatStatus(appointment.status)}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {appointment.status === 'pending' && (
                <>
                  <Link
                    href={`/dentist/appointments/${appointment.id}/confirm`}
                    variant="default"
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </Link>
                  <Link
                    href={`/dentist/appointments/${appointment.id}/reschedule`}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Suggest New Time
                  </Link>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={openCancelDialog}
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </Button>
                </>
              )}

              {appointment.status === 'suggested' && (
                <Badge variant="warning" className="px-3 py-1 text-sm">
                  Awaiting Patient Response
                </Badge>
              )}

              {appointment.status === 'confirmed' && (
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/dentist/appointments/${appointment.id}/complete`}
                    variant="secondary"
                    className="gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Completed
                  </Link>
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={openCancelDialog}
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}

              {appointment.status === 'completed' && (
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                  Completed
                </Badge>
              )}

              {appointment.status === 'cancelled' && (
                <Badge variant="destructive" className="px-3 py-1 text-sm">
                  {appointment.cancellation_reason ? 'Cancelled/Rejected' : 'Cancelled'}
                </Badge>
              )}
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="mx-6 mb-6">
            <h3 className="mb-4 text-lg font-semibold">Patient Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex gap-3 items-start">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-muted-foreground">{appointment.patient_name}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{appointment.patient_email}</p>
                </div>
              </div>

              {appointment.patient_phone && (
                <div className="flex gap-3 items-start">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-muted-foreground">{appointment.patient_phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Appointment Details Section */}
          <div className="grid grid-cols-1 gap-6 mx-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <CalendarClock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-muted-foreground">{date}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-muted-foreground">{time} ({appointment.duration_minutes} minutes)</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Cost</p>
                      <p className="text-muted-foreground">₱{appointment.cost}</p>
                    </div>

                    {(['confirmed', 'completed'].includes(appointment.status)) && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="payment-status" className="text-muted-foreground">
                          {isPaidLoading ? 'Updating...' : (appointment.is_paid ? 'Paid' : 'Unpaid')}
                        </Label>
                        <Switch
                          id="payment-status"
                          checked={appointment.is_paid}
                          disabled={isPaidLoading}
                          onCheckedChange={() => {
                            setIsPaidLoading(true);
                            router.post(`/dentist/appointments/${appointment.id}/toggle-payment`, {}, {
                              onSuccess: () => {
                                setIsPaidLoading(false);
                              },
                              onError: () => {
                                setIsPaidLoading(false);
                              }
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {appointment.status === 'cancelled' && appointment.cancellation_reason && (
                <div className="flex gap-3 items-start">
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
          <Separator className="my-4" />
          <div className="mx-6 mb-4 space-y-4">
            {appointment.notes && (
              <div>
                <h3 className="mb-2 text-lg font-semibold">Patient Notes</h3>
                <p className="whitespace-pre-line text-muted-foreground">{appointment.notes}</p>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Treatment Notes</h3>
                {!isEditing && (
                  <Link
                    href="#"
                    variant="outline"
                    size="sm"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="mr-1 w-4 h-4" />
                    Edit Notes
                  </Link>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)} className="space-y-4">
                  <Textarea
                    value={form.data.treatment_notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => form.setData('treatment_notes', e.target.value)}
                    placeholder="Enter treatment notes..."
                    rows={5}
                    className="w-full"
                  />
                  <div className="flex gap-2 justify-end">
                    <Link
                      href="#"
                      variant="outline"
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        e.preventDefault();
                        setIsEditing(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      className="inline-flex justify-center items-center px-4 py-2 h-10 text-sm font-medium whitespace-nowrap rounded-md transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                      disabled={form.processing}
                    >
                      {form.processing ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="whitespace-pre-line text-muted-foreground">
                  {appointment.treatment_notes || 'No treatment notes added yet.'}
                </p>
              )}
            </div>
          </div>
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
                <p><strong>Patient:</strong> {appointment.patient_name}</p>
                <p><strong>Service:</strong> {appointment.service_name}</p>
                <p><strong>Date/Time:</strong> {format(new Date(appointment.appointment_datetime), 'MMM d, yyyy')} at {format(new Date(appointment.appointment_datetime), 'h:mm a')}</p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="cancellation-reason" className="text-sm font-medium">
              Cancellation Reason <span className="text-muted-foreground">(will be shared with the patient)</span>
            </Label>
            <Textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancellationReason(e.target.value)}
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
