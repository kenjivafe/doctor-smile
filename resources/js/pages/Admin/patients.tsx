import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patients',
        href: '/admin/patients',
    },
];

export default function Patients() {
    return (
        <PageTemplate title="Patient Management" breadcrumbs={breadcrumbs} />
    );
}
