import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarClock, Clock, Info, CheckCircle, XCircle, Edit, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Card } from '@/components/ui/card';
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
    case 'cancelled':
      return 'destructive';
    case 'suggested':
    case 'pending':
      return 'warning';
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

  return (
    <>
      <Head title="Appointments Management" />
      <PageTemplate title="Appointments Management" breadcrumbs={breadcrumbs}>
        <Card className="p-6">
          {appointments.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-12 text-center">
              <CalendarClock className="mb-4 w-12 h-12 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No Appointments Yet</h3>
              <p className="mb-6 text-muted-foreground">
                You don't have any appointments scheduled yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableCaption>A list of your patient appointments</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.service_name}</TableCell>
                    <TableCell>{appointment.patient_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="flex gap-1 items-center">
                          <CalendarClock className="w-3 h-3" />
                          {format(new Date(appointment.appointment_datetime), 'MMM d, yyyy')}
                        </span>
                        <span className="flex gap-1 items-center text-muted-foreground">
                          <Clock className="w-3 h-3" />
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
                    <TableCell>₱{appointment.cost}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {formatStatus(appointment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Link
                          variant="outline"
                          href={`/dentist/appointments/${appointment.id}`}
                          className="inline-flex justify-center items-center p-0 w-9 h-9 text-sm font-medium rounded-md border transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground dark:bg-popover"
                        >
                          <Info className="w-4 h-4" />
                          <span className="sr-only">Details</span>
                        </Link>
                        {(['pending', 'suggested', 'confirmed'] as AppointmentStatus[]).includes(appointment.status) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="inline-flex justify-center items-center p-0 w-9 h-9 text-sm font-medium rounded-md border transition-colors ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-input bg-background hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground dark:bg-popover">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="sr-only">Actions</span>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {/* Actions for pending appointments */}
                              {appointment.status === 'pending' && (
                                <>
                                  <div className="m-1">
                                    <Link
                                      href={`/dentist/appointments/${appointment.id}/confirm`}
                                      className="flex justify-between items-center px-2 py-2 w-full text-emerald-600 rounded bg-popover hover:text-white hover:bg-emerald-600"
                                    >
                                      <div className="flex-grow text-sm font-medium text-left">Confirm</div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4" />
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="m-1">
                                    <Link
                                      href={`/dentist/appointments/${appointment.id}/reschedule`}
                                      className="flex justify-between items-center px-2 py-2 w-full text-blue-600 rounded bg-popover hover:text-white hover:bg-blue-600"
                                    >
                                      <div className="flex-grow text-sm font-medium text-left">Reschedule</div>
                                      <div className="flex items-center">
                                        <Edit className="w-4 h-4" />
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="m-1">
                                    <Link
                                      href={`/dentist/appointments/${appointment.id}/cancel`}
                                      className="flex justify-between items-center px-2 py-2 w-full text-red-600 rounded bg-popover hover:text-white hover:bg-red-600"
                                    >
                                      <div className="flex-grow text-sm font-medium text-left">Cancel</div>
                                      <div className="flex items-center">
                                        <XCircle className="w-4 h-4" />
                                      </div>
                                    </Link>
                                  </div>
                                </>
                              )}

                              {/* Actions for suggested appointments */}
                              {appointment.status === 'suggested' && (
                                <div className="m-1">
                                  <Link
                                    href={`/dentist/appointments/${appointment.id}/cancel`}
                                    className="flex justify-between items-center px-2 py-2 w-full text-red-600 rounded hover:text-white bg-popover hover:bg-red-600"
                                  >
                                    <div className="flex-grow text-sm font-medium text-left">Cancel Suggestion</div>
                                    <div className="flex items-center">
                                      <XCircle className="w-4 h-4" />
                                    </div>
                                  </Link>
                                </div>
                              )}

                              {/* Actions for confirmed appointments */}
                              {appointment.status === 'confirmed' && (
                                <>
                                  <div className="m-1">
                                    <Link
                                      href={`/dentist/appointments/${appointment.id}/complete`}
                                      className="flex justify-between items-center px-2 py-2 w-full text-emerald-600 rounded bg-popover hover:text-white hover:bg-emerald-600"
                                    >
                                      <div className="flex-grow text-sm font-medium text-left">Complete</div>
                                      <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4" />
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="m-1">
                                    <Link
                                      href={`/dentist/appointments/${appointment.id}/cancel`}
                                      className="flex justify-between items-center px-2 py-2 w-full text-red-600 rounded bg-popover hover:text-white hover:bg-red-600"
                                    >
                                      <div className="flex-grow text-sm font-medium text-left">Cancel</div>
                                      <div className="flex items-center">
                                        <XCircle className="w-4 h-4" />
                                      </div>
                                    </Link>
                                  </div>
                                </>
                              )}

                              {/* Actions for completed appointments - no actions available */}
                              {appointment.status === 'completed' && (
                                <div className="py-2 text-sm text-center text-muted-foreground">
                                  No actions available
                                </div>
                              )}

                              {/* Actions for cancelled appointments - no actions available */}
                              {appointment.status === 'cancelled' && (
                                <div className="py-2 text-sm text-center text-muted-foreground">
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
