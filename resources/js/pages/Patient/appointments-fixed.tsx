import * as React from 'react';
import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarClock, Clock, Info, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/alert-dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type AppointmentStatus = 'pending' | 'suggested' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

interface Appointment {
  id: number;
  dentist_name: string;
  service_name: string;
  appointment_datetime: string;
  status: AppointmentStatus;
  duration_minutes: number;
}

// Types defined directly in usePage generic type

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Appointments',
    href: '/patient/appointments',
  },
];

// Function to get the appropriate badge variant based on appointment status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'default'; // Primary color
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'suggested':
      return 'secondary';
    case 'cancelled':
    case 'rejected':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Function to format status for display
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function Appointments() {
  const { appointments } = usePage<{ appointments: Appointment[] }>().props;
  const [loading, setLoading] = React.useState<boolean>(false);
  const [appointmentToCancel, setAppointmentToCancel] = React.useState<number | null>(null);
  const [appointmentToAccept, setAppointmentToAccept] = React.useState<number | null>(null);
  const [appointmentToDecline, setAppointmentToDecline] = React.useState<number | null>(null);
  
  // Function to handle cancellation
  const handleCancelAppointment = () => {
    if (!appointmentToCancel) return;
    setLoading(true);
    
    router.post(`/patient/appointments/${appointmentToCancel}/cancel`, {}, {
      onSuccess: () => {
        setAppointmentToCancel(null);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Error cancelling appointment:', error);
        setLoading(false);
      },
    });
  };
  
  // Function to handle accepting a suggested time
  const handleAcceptSuggestion = () => {
    if (!appointmentToAccept) return;
    setLoading(true);
    
    router.post(`/patient/appointments/${appointmentToAccept}/confirm-suggestion`, {}, {
      onSuccess: () => {
        setAppointmentToAccept(null);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Error accepting suggested time:', error);
        setLoading(false);
      },
    });
  };
  
  // Function to handle declining a suggested time
  const handleDeclineSuggestion = () => {
    if (!appointmentToDecline) return;
    setLoading(true);
    
    router.post(`/patient/appointments/${appointmentToDecline}/decline-suggestion`, {}, {
      onSuccess: () => {
        setAppointmentToDecline(null);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Error declining suggested time:', error);
        setLoading(false);
      },
    });
  };

  return (
    <>
      <Head title="Appointments" />
      
      {/* Confirmation dialogs */}
      <ConfirmDialog
        open={!!appointmentToCancel}
        onOpenChange={() => setAppointmentToCancel(null)}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        onConfirm={handleCancelAppointment}
        loading={loading}
      />
      
      <ConfirmDialog
        open={!!appointmentToAccept}
        onOpenChange={() => setAppointmentToAccept(null)}
        title="Confirm Appointment"
        description="Are you sure you want to accept this suggested appointment time?"
        onConfirm={handleAcceptSuggestion}
        loading={loading}
      />
      
      <ConfirmDialog
        open={!!appointmentToDecline}
        onOpenChange={() => setAppointmentToDecline(null)}
        title="Decline Appointment"
        description="Are you sure you want to decline this suggested appointment time? This will cancel the appointment."
        onConfirm={handleDeclineSuggestion}
        loading={loading}
      />
      
      <PageTemplate 
        title="My Appointments"
        description="View and manage your upcoming dental appointments."
        breadcrumbs={breadcrumbs}
      >
        <Card className="p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You don't have any appointments yet.</p>
              <Link href="/patient/book-appointment" variant="default">
                Book an Appointment
              </Link>
            </div>
          ) : (
            <Table>
              <TableCaption>Your scheduled appointments</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Dentist</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.service_name}</TableCell>
                    <TableCell>Dr. {appointment.dentist_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {format(new Date(appointment.appointment_datetime), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {/* Format the time to be more user-friendly */}
                          {(() => {
                            const timePart = appointment.appointment_datetime.split('T')[1].substring(0, 5);
                            const [hours, minutes] = timePart.split(':').map(Number);
                            const period = hours >= 12 ? 'PM' : 'AM';
                            const displayHours = hours % 12 || 12;
                            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                          })()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{appointment.duration_minutes} min</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {formatStatus(appointment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          variant="outline"
                          href={`/patient/appointments/${appointment.id}`}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0"
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Details</span>
                        </Link>
                        {(['pending', 'suggested', 'confirmed'] as AppointmentStatus[]).includes(appointment.status) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover p-2 text-popover-foreground border border-border shadow-md rounded-md">
                              {/* Actions for confirmed appointments */}
                              {appointment.status === 'confirmed' && (
                                <div className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() => setAppointmentToCancel(appointment.id)}
                                    className="flex items-center justify-between w-full bg-background dark:bg-popover hover:bg-destructive text-destructive hover:text-destructive-foreground py-2 px-2 rounded transition-colors"
                                  >
                                    <div className="flex-grow text-left text-sm font-medium">Cancel</div>
                                    <div className="flex items-center">
                                      <XCircle className="h-4 w-4" />
                                    </div>
                                  </button>
                                </div>
                              )}
                              
                              {/* Actions for pending appointments */}
                              {appointment.status === 'pending' && (
                                <div className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() => setAppointmentToCancel(appointment.id)}
                                    className="flex items-center justify-between w-full bg-background dark:bg-popover hover:bg-destructive text-destructive hover:text-destructive-foreground py-2 px-2 rounded transition-colors"
                                  >
                                    <div className="flex-grow text-left text-sm font-medium">Cancel</div>
                                    <div className="flex items-center">
                                      <XCircle className="h-4 w-4" />
                                    </div>
                                  </button>
                                </div>
                              )}
                              
                              {/* Actions for suggested appointments */}
                              {appointment.status === 'suggested' && (
                                <>
                                  <div className="mb-1">
                                    <button 
                                      type="button"
                                      onClick={() => setAppointmentToAccept(appointment.id)}
                                      className="flex items-center justify-between w-full bg-background dark:bg-popover hover:bg-primary text-primary hover:text-primary-foreground py-2 px-2 rounded transition-colors"
                                    >
                                      <div className="flex-grow text-left text-sm font-medium">Accept</div>
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4" />
                                      </div>
                                    </button>
                                  </div>
                                  <div className="mt-1">
                                    <button 
                                      type="button"
                                      onClick={() => setAppointmentToDecline(appointment.id)}
                                      className="flex items-center justify-between w-full bg-background dark:bg-popover hover:bg-destructive text-destructive hover:text-destructive-foreground py-2 px-2 rounded transition-colors"
                                    >
                                      <div className="flex-grow text-left text-sm font-medium">Decline</div>
                                      <div className="flex items-center">
                                        <XCircle className="h-4 w-4" />
                                      </div>
                                    </button>
                                  </div>
                                </>
                              )}
                              
                              {/* Actions for completed/cancelled appointments - no actions available */}
                              {['completed', 'cancelled'].includes(appointment.status) && (
                                <div className="text-center py-2 text-sm text-muted-foreground">
                                  No actions available
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageTemplate>
    </>
  );
}
