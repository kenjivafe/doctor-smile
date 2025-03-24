import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

interface PageTemplateProps {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    children?: React.ReactNode;
}

export function PageTemplate({ title, breadcrumbs, children }: PageTemplateProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                </div>
                {children || (
                    <div className="grid h-full place-items-center">
                        <div className="text-center">
                            <h2 className="text-xl font-medium">Coming Soon</h2>
                            <p className="text-muted-foreground mt-1">This feature is currently under development.</p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
