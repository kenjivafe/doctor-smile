import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointments',
        href: '/admin/appointments',
    },
];

export default function Appointments() {
    return (
        <PageTemplate title="Appointment Management" breadcrumbs={breadcrumbs} />
    );
}
