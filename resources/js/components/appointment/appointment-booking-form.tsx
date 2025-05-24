import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import ServiceSelection from '@/components/appointment/steps/service-selection';
import DentistSelection from '@/components/appointment/steps/dentist-selection';
import { AppointmentTimePicker } from '@/components/appointment/steps/appointment-time-picker';
import BookingSummary from '@/components/appointment/steps/booking-summary';

type Step = 'service' | 'dentist' | 'datetime' | 'summary';

interface AppointmentFormData {
  dental_service_id?: number;
  dentist_id?: number;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  [key: string]: string | number | undefined;
}

interface AppointmentBookingFormProps {
  availableServices?: Array<{
    id: number;
    name: string;
    description: string;
    price: string;
    duration_minutes: number;
    category?: string;
    image_path?: string;
  }>;
  availableDentists?: Array<{
    id: number;
    name: string;
    specialty?: string;
    avatar?: string;
  }>;
}

function AppointmentBookingForm({
  availableServices = [],
  availableDentists = [],
}: AppointmentBookingFormProps) {
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { data, setData, post, processing, errors } = useForm<AppointmentFormData>({
    dental_service_id: undefined,
    dentist_id: undefined,
    appointment_date: undefined,
    appointment_time: undefined,
    notes: '',
  });

  const steps: { id: Step; title: string }[] = [
    { id: 'service', title: 'Select Service' },
    { id: 'dentist', title: 'Choose Dentist' },
    { id: 'datetime', title: 'Select Date & Time' },
    { id: 'summary', title: 'Review & Confirm' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting appointment data:', data);

    // Clear any previous general errors
    setGeneralError(null);

    // Update form data with correctly formatted values
    data.dental_service_id = data.dental_service_id ? Number(data.dental_service_id) : undefined;
    data.dentist_id = data.dentist_id ? Number(data.dentist_id) : undefined;
    data.appointment_date = data.appointment_date || '';
    data.appointment_time = data.appointment_time || '';
    data.notes = data.notes || '';

    console.log('Formatted appointment data:', data);

    post(route('patient.appointments.store'), {
      onSuccess: () => {
        console.log('Appointment created successfully');
        setIsSubmitted(true);
      },
      onError: (errors: Record<string, string>) => {
        console.error('Error creating appointment:', errors);

        // Check for general errors
        if (errors.general) {
          setGeneralError(errors.general);
        }

        // Stay on the relevant step if there's an error
        if (errors.dental_service_id) {
          setCurrentStep('service');
        } else if (errors.dentist_id) {
          setCurrentStep('dentist');
        } else if (errors.appointment_date || errors.appointment_time) {
          setCurrentStep('datetime');
        }
      }
    });
  };

  const renderStepContent = () => {
    // Find the selected service to get its duration (moved outside case block)
    const selectedService = availableServices.find(
      service => service.id === data.dental_service_id
    );
    const serviceDuration = selectedService?.duration_minutes || 30; // Default to 30 minutes if not found

    switch (currentStep) {
      case 'service':
        return (
          <ServiceSelection
            services={availableServices}
            selectedServiceId={data.dental_service_id}
            onSelectService={(id) => setData('dental_service_id', id)}
            error={errors.dental_service_id}
          />
        );
      case 'dentist':
        return (
          <DentistSelection
            dentists={availableDentists}
            selectedDentistId={data.dentist_id}
            onSelectDentist={(id) => setData('dentist_id', id)}
            error={errors.dentist_id}
          />
        );
      case 'datetime':
        return (
          <AppointmentTimePicker
            selectedDate={data.appointment_date}
            selectedTime={data.appointment_time}
            onSelectDate={(date) => setData('appointment_date', date)}
            onSelectTime={(time) => setData('appointment_time', time)}
            dateError={errors.appointment_date}
            timeError={errors.appointment_time}
            serviceDuration={serviceDuration}
            dentistId={data.dentist_id}
            serviceId={data.dental_service_id}
          />
        );
      case 'summary':
        return (
          <BookingSummary
            appointmentData={data}
            services={availableServices}
            dentists={availableDentists}
            onNotesChange={(notes) => setData('notes', notes)}
            error={errors.notes}
          />
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <Card className="p-6 mx-auto w-full">
        <div className="flex flex-col justify-center items-center py-12 text-center">
          <CheckCircle2 className="mb-4 w-16 h-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-semibold">Appointment Request Submitted!</h2>
          <p className="mb-6 text-muted-foreground">
            Your appointment request has been sent to the dentist. You'll receive a notification
            once it's approved or if any changes are suggested.
          </p>
          <Button
            onClick={() => window.location.href = route('patient.appointments')}
          >
            View My Appointments
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full">
      <div className="p-6">
        {generalError && (
          <div className="p-4 mb-6 rounded-md bg-destructive text-destructive-foreground">
            <p className="font-medium">{generalError}</p>
          </div>
        )}
        <div className="mb-6 mt-[-1rem]">
          <div className="hidden relative mb-4 md:block">
            <div className="absolute top-4 w-full h-1 bg-muted"></div>
            <div className="flex relative justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 z-10 ${
                      currentStepIndex >= index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`text-xs ${
                      currentStepIndex === index
                        ? 'font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-medium">Step {currentStepIndex + 1} of {steps.length}</span>
              <span className="text-muted-foreground">{steps[currentStepIndex].title}</span>
            </div>
            <div className="overflow-hidden w-full h-1 rounded-full bg-muted">
              <div
                className="h-full transition-all duration-300 ease-in-out bg-primary"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-6">
          {currentStepIndex > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={processing}
            >
              Previous
            </Button>
          ) : (
            <div></div>
          )}

          {currentStepIndex < steps.length - 1 ? (
            <Button
              type="button"
              onClick={goToNextStep}
              disabled={
                (currentStep === 'service' && !data.dental_service_id) ||
                (currentStep === 'dentist' && !data.dentist_id) ||
                (currentStep === 'datetime' && (!data.appointment_date || !data.appointment_time)) ||
                processing
              }
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={processing}
            >
              Book Appointment
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default AppointmentBookingForm;
