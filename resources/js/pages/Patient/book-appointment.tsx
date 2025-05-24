import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import AppointmentBookingForm from '@/components/appointment/appointment-booking-form';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Book Appointment',
        href: '/patient/book-appointment',
    },
];

interface BookAppointmentProps {
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
    error?: string;
}

export default function BookAppointment({
    availableServices = [],
    availableDentists = [],
    error
}: BookAppointmentProps) {
    // Removed unused auth variable

    return (
        <>
            <Head title="Book Appointment" />
            <PageTemplate title="Book Appointment" breadcrumbs={breadcrumbs}>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="mx-auto w-full">
                    {/* <p className="mb-8 text-muted-foreground">
                        Book your dental appointment in just a few steps. Select your preferred service,
                        dentist, and a convenient time slot.
                    </p> */}

                    <AppointmentBookingForm
                        availableServices={availableServices}
                        availableDentists={availableDentists}
                    />
                </div>
            </PageTemplate>
        </>
    );
}
