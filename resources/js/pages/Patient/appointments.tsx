import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointments',
        href: '/patient/appointments',
    },
];

export default function Appointments() {
    return (
        <>
            <Head title="My Appointments" />
            <PageTemplate title="My Appointments" breadcrumbs={breadcrumbs}>
            </PageTemplate>
        </>
    );
}
