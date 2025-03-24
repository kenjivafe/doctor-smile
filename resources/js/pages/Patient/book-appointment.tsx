import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Book Appointment',
        href: '/patient/book-appointment',
    },
];

export default function BookAppointment() {
    return (
        <>
            <Head title="Book Appointment" />
            <PageTemplate title="Book Appointment" breadcrumbs={breadcrumbs}>
            </PageTemplate>
        </>
    );
}
