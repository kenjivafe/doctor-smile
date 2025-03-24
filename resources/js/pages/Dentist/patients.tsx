import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patients',
        href: '/dentist/patients',
    },
];

export default function Patients() {
    return (
        <PageTemplate title="My Patients" breadcrumbs={breadcrumbs} />
    );
}
