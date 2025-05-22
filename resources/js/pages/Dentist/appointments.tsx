import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarClock, Clock, Info, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from '@/components/ui/link';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Appointment {
  id: number;
  patient_name: string;
  service_name: string;
  appointment_datetime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
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
    case 'rescheduled':
      return 'warning';
    case 'pending':
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
                          size="sm"
                          href={`/dentist/appointments/${appointment.id}`}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Details</span>
                        </Link>
                        
                        {appointment.status === 'pending' && (
                          <>
                            <Link
                              variant="default"
                              size="sm"
                              href={`/dentist/appointments/${appointment.id}/confirm`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Link>
                            <Link
                              variant="outline"
                              size="sm"
                              href={`/dentist/appointments/${appointment.id}/reschedule`}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Reschedule
                            </Link>
                            <Link
                              variant="destructive"
                              size="sm"
                              href={`/dentist/appointments/${appointment.id}/cancel`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Link>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <Link
                            variant="secondary"
                            size="sm"
                            href={`/dentist/appointments/${appointment.id}/complete`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Link>
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
