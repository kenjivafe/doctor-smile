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
            <div className="flex flex-col flex-1 gap-4 p-4 m-4 h-full rounded-xl">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                </div>
                {children || (
                    <div className="grid place-items-center h-full">
                        <div className="text-center">
                            <h2 className="text-xl font-medium">Coming Soon</h2>
                            <p className="mt-1 text-muted-foreground">This feature is currently under development.</p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
