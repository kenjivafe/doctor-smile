import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payments',
        href: '/patient/payments',
    },
];

export default function Payments() {
    return (
        <>
            <Head title="Payments" />
            <PageTemplate title="Payment History" breadcrumbs={breadcrumbs}>
            </PageTemplate>
        </>
    );
}
