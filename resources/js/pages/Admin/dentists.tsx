import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dentists',
        href: '/admin/dentists',
    },
];

export default function Dentists() {
    return (
        <PageTemplate title="Dentist Management" breadcrumbs={breadcrumbs} />
    );
}
