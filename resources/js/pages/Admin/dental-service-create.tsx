import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DentalServiceForm } from '@/components/dental-service-form';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Dental Services',
    href: '/admin/dental-services',
  },
  {
    title: 'Add New Service',
    href: '/admin/dental-services/create',
  },
];

export default function CreateDentalService() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add New Dental Service" />
      <div className="container p-8 mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Add New Dental Service</h1>
          <p className="text-muted-foreground">
            Create a new dental service for the clinic
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Enter the details for the new dental service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DentalServiceForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
