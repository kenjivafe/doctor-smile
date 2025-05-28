import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ClipboardCheck, AlertCircle, ClipboardList, Ban } from 'lucide-react';
import { AppointmentsTable } from '@/components/appointments-table';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Appointments',
    href: '/admin/appointments',
  },
];

// Match the Appointment interface from appointments-table.tsx
interface Appointment {
  id: number;
  patient_name: string;
  patient_id: number;
  dentist_name: string;
  dentist_id: number;
  service_name: string;
  service_id: number;
  appointment_datetime: string;
  status: string;
  duration_minutes: number;
  cost: number;
  payment_status?: 'paid' | 'unpaid';
  notes?: string;
  cancellation_reason?: string;
}

interface AppointmentsPageProps {
  appointments?: Appointment[] | Record<string, Appointment>;
}

export default function Appointments({ appointments = [] }: AppointmentsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Convert appointments object to array if it's not already
  const appointmentsArray: Appointment[] = Array.isArray(appointments)
    ? appointments
    : Object.values(appointments as Record<string, Appointment>);

  // Define today's date for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter appointments based on search query and status
  const filteredAppointments = appointmentsArray.filter(appointment => {
    const matchesSearch = appointment.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalAppointments = appointmentsArray.length;
  const todayAppointments = appointmentsArray.filter(appointment => {
    if (!appointment.appointment_datetime) return false;
    const appointmentDate = new Date(appointment.appointment_datetime);
    appointmentDate.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  }).length;
  const completedAppointments = appointmentsArray.filter(
    appointment => appointment.status === 'completed'
  ).length;
  const cancelledAppointments = appointmentsArray.filter(
    appointment => appointment.status === 'cancelled'
  ).length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Appointments Management" />
      <div className="container p-8 mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground">
            View and manage all appointments in the system
          </p>
        </div>

        <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Appointments
              </CardTitle>
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                All appointments in the system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Today's Appointments
              </CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Completed Appointments
              </CardTitle>
              <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">
                Cancellations
              </CardTitle>
              <Ban className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cancelledAppointments}</div>
              <p className="text-xs text-muted-foreground">
                Cancelled appointments
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appointments List</CardTitle>
            <CardDescription>
              View and manage all patient appointments
            </CardDescription>
            <div className="flex flex-col gap-4 mt-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Search by patient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suggested">Suggested</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {/* Removed redundant heading */}

            {/* Debug table removed */}

            {filteredAppointments.length > 0 ? (
              <AppointmentsTable data={filteredAppointments} />
            ) : (
              <div className="flex flex-col justify-center items-center p-8 text-center">
                <AlertCircle className="mb-2 w-10 h-10 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No appointments found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? "Try adjusting your search or filter criteria"
                    : "There are no appointments currently scheduled"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
