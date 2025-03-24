import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Medical Records',
        href: '/patient/records',
    },
];

export default function MedicalRecords() {
    return (
        <>
            <Head title="Medical Records" />
            <PageTemplate title="Medical Records" breadcrumbs={breadcrumbs}>
            </PageTemplate>
        </>
    );
}
