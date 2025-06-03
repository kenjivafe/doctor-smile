import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  Stethoscope,
  FileText,
  DollarSign,
  AlertCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    created_at: string;
    updated_at: string;
}

interface PageProps {
    appointment: Appointment;
}

const statusVariantMap: Record<string, 'warning' | 'default' | 'destructive' | 'outline' | 'secondary'> = {
  pending: 'warning',
  confirmed: 'default',
  completed: 'default',
  cancelled: 'destructive',
  suggested: 'outline'
};

export default function AppointmentDetails() {
  const { appointment } = usePage<PageProps>().props;
  const [cancellationReason, setCancellationReason] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Parse appointment date and calculate end time
  const appointmentDate = new Date(appointment.appointment_datetime);
  const endTime = new Date(appointmentDate.getTime() + (appointment.duration_minutes * 60000));

  // Format date and time for display
  const formattedDate = format(appointmentDate, 'MMMM d, yyyy');
  const formattedStartTime = format(appointmentDate, 'h:mm a');
  const formattedEndTime = format(endTime, 'h:mm a');

  const handleCancelAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellationReason.trim()) return;

    setIsSubmitting(true);

    router.post(`/admin/appointments/${appointment.id}/cancel`, {
      cancellation_reason: cancellationReason,
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setCancellationReason('');
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
      preserveScroll: true,
    });
  };

  return (
    <AppLayout>
        <Head title="Appointment Details" />
      <div className="m-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
            <p className="text-muted-foreground">
              Viewing details for appointment #{appointment.id}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/appointments">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Appointments
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Appointment Card */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Appointment Information</span>
                  <Badge variant={statusVariantMap[appointment.status as keyof typeof statusVariantMap] || 'outline'}>
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p>{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p>{formattedStartTime} - {formattedEndTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Patient</p>
                      <p>{appointment.patient_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Stethoscope className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Dentist</p>
                      <p>{appointment.dentist_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Service</p>
                      <p>{appointment.service_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cost</p>
                      <p>${Number(appointment.cost).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="pt-4 border-t">
                    <h3 className="mb-2 text-sm font-medium">Notes</h3>
                    <p className="text-sm whitespace-pre-line text-muted-foreground">
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {appointment.cancellation_reason && (
                  <div className="pt-4 border-t">
                    <h3 className="flex items-center text-sm font-medium text-destructive">
                      <AlertCircle className="mr-2 w-4 h-4" />
                      Cancellation Reason
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {appointment.cancellation_reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {['pending', 'confirmed'].includes(appointment.status) && (
                  <>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start w-full text-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="mr-2 w-4 h-4" />
                          Cancel Appointment
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Appointment</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel this appointment? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCancelAppointment} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cancellationReason">Reason for cancellation</Label>
                            <Textarea
                              id="cancellationReason"
                              value={cancellationReason}
                              onChange={(e) => setCancellationReason(e.target.value)}
                              placeholder="Please provide a reason for cancellation"
                              required
                              className="min-h-[100px]"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              variant="destructive"
                              disabled={!cancellationReason.trim() || isSubmitting}
                            >
                              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                {appointment.status === 'confirmed' && (
                  <Button variant="outline" className="justify-start w-full text-green-600" asChild>
                    <Link href={`/admin/appointments/${appointment.id}/complete`}>
                      <CheckCircle className="mr-2 w-4 h-4" />
                      Mark as Completed
                    </Link>
                  </Button>
                )}
                <Button variant="outline" className="justify-start w-full" asChild>
                  <Link href={`/admin/patients/${appointment.patient_id}`}>
                    <User className="mr-2 w-4 h-4" />
                    View Patient
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={appointment.payment_status === 'paid' ? 'default' : 'destructive'}>
                    {appointment.payment_status?.toUpperCase() || 'UNPAID'}
                  </Badge>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
