import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointments',
        href: '/dentist/appointments',
    },
];

export default function Appointments() {
    return (
        <PageTemplate title="My Appointments" breadcrumbs={breadcrumbs} />
    );
}
