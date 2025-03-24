import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Schedule',
        href: '/dentist/schedule',
    },
];

export default function Schedule() {
    return (
        <PageTemplate title="My Schedule" breadcrumbs={breadcrumbs} />
    );
}
