import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@/components/ui/link';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppointmentTimePicker } from '@/components/appointment/steps/appointment-time-picker';

interface AppointmentRescheduleProps {
  id: number;
  appointment: {
    id: number;
    patient_name: string;
    service_name: string;
    appointment_datetime: string;
    duration_minutes: number;
    dental_service_id: number;
    status?: 'pending' | 'suggested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  };
}

interface PageProps extends AppointmentRescheduleProps {
  auth: {
    user: {
      id: number;
    }
  };
}

export default function RescheduleAppointment() {
  const page = usePage();
  // Extract the CSRF token safely for our form
  const csrfToken = typeof page.props.csrf_token === 'string' ? page.props.csrf_token : '';
  const { id, appointment, auth } = page.props as unknown as PageProps;
  const dentistId = auth.user.id;
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(appointment.appointment_datetime), 'yyyy-MM-dd')
  );

  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(appointment.appointment_datetime), 'HH:mm')
  );

  const [dateError, setDateError] = useState<string | undefined>();
  const [timeError, setTimeError] = useState<string | undefined>();

  const form = useForm({
    appointment_datetime: `${selectedDate}T${selectedTime}`,
    duration_minutes: appointment.duration_minutes || 30,
    notes: '',
  });

  // Generate breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Appointments',
      href: '/dentist/appointments',
    },
    {
      title: `Appointment #${id}`,
      href: `/dentist/appointments/${id}`,
    },
    {
      title: 'Suggest New Time',
      href: `/dentist/appointments/${id}/reschedule`,
    },
  ];

  // Handle date selection
  const handleDateSelection = (date: string) => {
    setSelectedDate(date);
    form.setData('appointment_datetime', `${date}T${selectedTime}`);
    setDateError(undefined);
  };

  // Handle time selection
  const handleTimeSelection = (time: string) => {
    setSelectedTime(time);
    // Update form data but don't submit - user must click Submit button
    form.setData('appointment_datetime', `${selectedDate}T${time}`);
    setTimeError(undefined);
  };

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    form.setData('notes', e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (!selectedDate) {
      setDateError('Please select a date');
      return;
    }

    if (!selectedTime) {
      setTimeError('Please select a time');
      return;
    }

    form.post(`/dentist/appointments/${id}/suggest-new-time`, {
      onSuccess: () => {
        // Redirect happens automatically
      },
    });
  };

  return (
    <>
      <Head title="Suggest New Appointment Time" />
      <PageTemplate title="Suggest New Appointment Time" breadcrumbs={breadcrumbs}>
            <p className="text-muted-foreground mt-[-2rem] mb-2">
              The patient will be notified of your suggested time and will need to confirm or decline it.
            </p>
        {/* <div className="mb-4">
          <Link
            href={`/dentist/appointments/${id}`}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointment
          </Link>
        </div> */}

        <Card className="p-6">
          {/* <div className="">
            <h2 className="mb-2 text-xl font-semibold">
              Suggest a new date & time for {appointment.patient_name}'s appointment
            </h2>
            <p className="text-muted-foreground">
              The patient will be notified of your suggested time and will need to confirm or decline it.
            </p>
          </div> */}

          {form.errors.appointment_datetime && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {form.errors.appointment_datetime}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <AppointmentTimePicker
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectDate={handleDateSelection}
                onSelectTime={handleTimeSelection}
                dateError={dateError}
                timeError={timeError}
                serviceDuration={appointment.duration_minutes}
                dentistId={dentistId}
                serviceId={appointment.dental_service_id}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="flex gap-2 items-center">
                Notes for Patient (Optional)
              </Label>
              <Textarea
                id="notes"
                value={form.data.notes}
                onChange={handleNotesChange}
                placeholder="Explain why you're suggesting a new time..."
                className="w-full"
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Link
                href={`/dentist/appointments/${id}`}
                variant="outline"
              >
                Cancel
              </Link>
              {appointment.status === 'suggested' && (
                <form 
                  method="POST" 
                  action={`/dentist/appointments/${id}/cancel`}
                  onSubmit={(e) => {
                    if (!confirm('Are you sure you want to cancel this suggestion?')) {
                      e.preventDefault();
                      return false;
                    }
                    return true;
                  }}
                  className="inline"
                >
                  <input type="hidden" name="_token" value={csrfToken} />
                  <input type="hidden" name="_method" value="POST" />
                  <button 
                    type="submit"
                    className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-md border border-input hover:bg-red-600 hover:text-white"
                  >
                    Cancel Suggestion
                  </button>
                </form>
              )}
              <Button
                type="submit"
                variant="default"
                disabled={form.processing}
              >
                {form.processing ? 'Suggesting...' : 'Suggest New Time'}
              </Button>
            </div>
          </form>
        </Card>
      </PageTemplate>
    </>
  );
}
