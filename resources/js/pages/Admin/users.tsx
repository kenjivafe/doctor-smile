import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Users',
        href: '/admin/users',
    },
];

export default function Users() {
    return (
        <PageTemplate title="User Management" breadcrumbs={breadcrumbs} />
    );
}
