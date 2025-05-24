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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarClock className="mb-4 h-12 w-12 text-muted-foreground" />
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
                    <TableCell>₱{appointment.cost}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(appointment.status)}>
                        {formatStatus(appointment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          variant="outline"
                          href={`/dentist/appointments/${appointment.id}`}
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
                            <DropdownMenuContent align="end" className="bg-white p-2">
                              {/* Actions for pending appointments */}
                              {appointment.status === 'pending' && (
                                <>
                                  <div className="mb-1">
                                    <Link 
                                      href={`/dentist/appointments/${appointment.id}/confirm`}
                                      className="flex items-center justify-between text-emerald-600 hover:text-white w-full bg-white hover:bg-emerald-600 py-2 px-2 rounded"
                                    >
                                      <div className="flex-grow text-left text-sm font-medium">Confirm</div>
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4" />
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="my-1">
                                    <Link 
                                      href={`/dentist/appointments/${appointment.id}/reschedule`}
                                      className="flex items-center justify-between text-blue-600 hover:text-white w-full bg-white hover:bg-blue-600 py-2 px-2 rounded"
                                    >
                                      <div className="flex-grow text-left text-sm font-medium">Suggest New Time</div>
                                      <div className="flex items-center">
                                        <Edit className="h-4 w-4" />
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="mt-1">
                                    <Link 
                                      href={`/dentist/appointments/${appointment.id}/cancel`} 
                                      className="flex items-center justify-between text-red-600 hover:text-white w-full bg-white hover:bg-red-600 py-2 px-2 rounded"
                                    >
                                      <div className="flex-grow text-left text-sm font-medium">Cancel</div>
                                      <div className="flex items-center">
                                        <XCircle className="h-4 w-4" />
                                      </div>
                                    </Link>
                                  </div>
                                </>
                              )}
                              
                              {/* Actions for suggested appointments */}
                              {appointment.status === 'suggested' && (
                                <div className="mt-1">
                                  <Link 
                                    href={`/dentist/appointments/${appointment.id}/cancel`} 
                                    className="flex items-center justify-between text-red-600 hover:text-white w-full bg-white hover:bg-red-600 py-2 px-2 rounded"
                                  >
                                    <div className="flex-grow text-left text-sm font-medium">Cancel Suggestion</div>
                                    <div className="flex items-center">
                                      <XCircle className="h-4 w-4" />
                                    </div>
                                  </Link>
                                </div>
                              )}
                              
                              {/* Actions for confirmed appointments */}
                              {appointment.status === 'confirmed' && (
                                <>
                                  <div className="mb-1">
                                    <Link 
                                      href={`/dentist/appointments/${appointment.id}/complete`}
                                      className="flex items-center justify-between text-emerald-600 hover:text-white w-full bg-white hover:bg-emerald-600 py-2 px-2 rounded"
                                    >
                                      <div className="flex-grow text-left text-sm font-medium">Complete</div>
                                      <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4" />
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="mt-1">
                                    <Link 
                                      href={`/dentist/appointments/${appointment.id}/cancel`} 
                                      className="flex items-center justify-between text-red-600 hover:text-white w-full bg-white hover:bg-red-600 py-2 px-2 rounded"
                                    >
                                      <div className="flex-grow text-left text-sm font-medium">Cancel</div>
                                      <div className="flex items-center">
                                        <XCircle className="h-4 w-4" />
                                      </div>
                                    </Link>
                                  </div>
                                </>
                              )}
                              
                              {/* Actions for completed appointments - no actions available */}
                              {appointment.status === 'completed' && (
                                <div className="text-center py-2 text-sm text-muted-foreground">
                                  No actions available
                                </div>
                              )}
                              
                              {/* Actions for cancelled appointments - no actions available */}
                              {appointment.status === 'cancelled' && (
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
