import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarClock, Clock, CheckCircle, XCircle, Edit, Eye, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ColumnDef } from '@tanstack/react-table';

type AppointmentStatus = 'pending' | 'suggested' | 'confirmed' | 'completed' | 'cancelled';

interface Appointment {
  id: number;
  patient_name: string;
  service_name: string;
  dental_service_id: number;
  appointment_datetime: string;
  status: AppointmentStatus;
  duration_minutes: number;
  cost: string;
}

interface AppointmentsProps {
  appointments: Appointment[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/dentist/dashboard',
  },
  {
    title: 'Appointments',
    href: '/dentist/appointments',
  },
];

// Function to get the appropriate badge variant based on appointment status
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'default'; // Primary color
    case 'completed':
      return 'secondary';
    case 'pending':
      return 'warning';
    case 'suggested':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

// Function to format the status text for display
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export default function Appointments() {
  const { appointments = [] } = usePage().props as unknown as AppointmentsProps;
  const [isLoading, setIsLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Function to open the cancel dialog
  const openCancelDialog = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  // Function to close the cancel dialog
  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setAppointmentToCancel(null);
    setCancellationReason('');
  };

  // Function to handle the cancellation submission
  const handleCancelAppointment = () => {
    if (!appointmentToCancel) return;

    setIsLoading(true);

    router.post(`/dentist/appointments/${appointmentToCancel.id}/cancel`, {
      cancellation_reason: cancellationReason || 'Cancelled by dentist'
    }, {
      onSuccess: () => {
        setIsLoading(false);
        closeCancelDialog();
        // Refresh the page to update the appointments list
        window.location.reload();
      },
      onError: () => {
        setIsLoading(false);
      }
    });
  };

  // Define columns for the appointments table
  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'service_name',
      header: 'Service',
      cell: ({ row }) => <div className="font-medium">{row.original.service_name}</div>,
    },
    {
      accessorKey: 'patient_name',
      header: 'Patient',
      cell: ({ row }) => <div>{row.original.patient_name}</div>,
    },
    {
      accessorKey: 'appointment_datetime',
      header: 'Date & Time',
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex flex-col">
            <span className="flex gap-1 items-center">
              <CalendarClock className="w-3 h-3" />
              {format(new Date(appointment.appointment_datetime), 'MMM d, yyyy')}
            </span>
            <span className="flex gap-1 items-center text-muted-foreground">
              <Clock className="w-3 h-3" />
              {format(new Date(appointment.appointment_datetime), 'h:mm a')}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'duration_minutes',
      header: 'Duration',
      cell: ({ row }) => <div>{row.original.duration_minutes} min</div>,
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }) => <div>₱{row.original.cost}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {formatStatus(row.original.status)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex gap-2 justify-end">
            <Link
              href={`/dentist/appointments/${appointment.id}`}
              className="flex justify-center items-center p-0 w-8 h-8 bg-transparent rounded-md shadow-none hover:bg-accent text-foreground hover:text-background"
            >
              <Eye className="w-4 h-4" />
              <span className="sr-only">View</span>
            </Link>

            {/* Different actions based on appointment status */}
            {appointment.status === 'pending' && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="flex justify-center items-center p-0 w-8 h-8 rounded-md hover:bg-accent hover:text-background">
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">Actions</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-2 rounded-md border shadow-md bg-popover text-popover-foreground border-border">
                  <div className="mb-1">
                    <button
                      type="button"
                      onClick={() => router.visit(`/dentist/appointments/${appointment.id}/confirm`)}
                      className="flex justify-between items-center px-2 py-2 w-full text-emerald-600 rounded transition-colors bg-background dark:bg-popover hover:bg-primary hover:text-primary-foreground dark:hover:bg-emerald-600 dark:hover:text-white"
                    >
                      <div className="flex-grow text-sm font-medium text-left">Approve</div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                  <div className="mb-1">
                    <button
                      type="button"
                      onClick={() => router.visit(`/dentist/appointments/${appointment.id}/reschedule`)}
                      className="flex justify-between items-center px-2 py-2 w-full text-blue-600 rounded transition-colors bg-background dark:bg-popover hover:bg-primary hover:text-primary-foreground dark:hover:bg-blue-600 dark:hover:text-white"
                    >
                      <div className="flex-grow text-sm font-medium text-left">Reschedule</div>
                      <div className="flex items-center">
                        <Edit className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => openCancelDialog(appointment)}
                      className="flex justify-between items-center px-2 py-2 w-full rounded transition-colors bg-background dark:bg-popover hover:bg-destructive text-destructive hover:text-destructive-foreground dark:hover:bg-red-600 dark:hover:text-white"
                    >
                      <div className="flex-grow text-sm font-medium text-left">Cancel</div>
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Actions for suggested appointments */}
            {appointment.status === 'suggested' && (
              <button
                type="button"
                onClick={() => openCancelDialog(appointment)}
                className="flex justify-center items-center p-0 w-8 h-8 rounded-md text-foreground hover:bg-destructive hover:text-background"
              >
                <XCircle className="w-4 h-4" />
                <span className="sr-only">Cancel</span>
              </button>
            )}

            {/* Actions for confirmed appointments */}
            {appointment.status === 'confirmed' && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="flex justify-center items-center p-0 w-8 h-8 rounded-md hover:bg-accent">
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">Actions</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="p-2 rounded-md border shadow-md bg-popover text-popover-foreground border-border">
                  <div className="mb-1">
                    <button
                      type="button"
                      onClick={() => router.visit(`/dentist/appointments/${appointment.id}/complete`)}
                      className="flex justify-between items-center px-2 py-2 w-full text-emerald-600 rounded transition-colors bg-background dark:bg-popover hover:bg-primary hover:text-primary-foreground dark:hover:bg-emerald-600 dark:hover:text-white"
                    >
                      <div className="flex-grow text-sm font-medium text-left">Complete</div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                  <div className="mt-1">
                    <button
                      type="button"
                      onClick={() => openCancelDialog(appointment)}
                      className="flex justify-between items-center px-2 py-2 w-full rounded transition-colors bg-background dark:bg-popover hover:bg-destructive text-destructive hover:text-destructive-foreground dark:hover:bg-red-600 dark:hover:text-white"
                    >
                      <div className="flex-grow text-sm font-medium text-left">Cancel</div>
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Appointments" />

      <div className="flex flex-col gap-4 p-6 m-4 h-full rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              View and manage your patient appointments.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>
              Your scheduled dental appointments with patients.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="flex flex-col justify-center items-center p-10 space-y-4 text-center">
                <div className="flex justify-center items-center w-16 h-16 rounded-full bg-primary/10">
                  <CalendarClock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Appointments Found</h3>
                <p className="max-w-md text-muted-foreground">
                  You don't have any appointments scheduled with patients yet.
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={appointments} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeCancelDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
              {appointmentToCancel && (
                <div className="mt-2 text-sm">
                  <p><strong>Patient:</strong> {appointmentToCancel.patient_name}</p>
                  <p><strong>Service:</strong> {appointmentToCancel.service_name}</p>
                  <p><strong>Date/Time:</strong> {format(new Date(appointmentToCancel.appointment_datetime), 'MMM d, yyyy')} at {format(new Date(appointmentToCancel.appointment_datetime), 'h:mm a')}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="cancellation-reason" className="text-sm font-medium">
              Cancellation Reason <span className="text-muted-foreground">(will be shared with the patient)</span>
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
    </AppLayout>
  );
}
