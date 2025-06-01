import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DentalServiceForm } from '@/components/dental-service-form';
import { type BreadcrumbItem } from '@/types';

interface DentalService {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: 'general' | 'cosmetic' | 'orthodontic' | 'surgical' | 'pediatric' | 'preventive';
  is_active: boolean;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

interface EditDentalServiceProps {
  service: DentalService;
}

export default function EditDentalService({ service }: EditDentalServiceProps) {
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
      title: `Edit ${service?.name || 'Service'}`,
      href: `/admin/dental-services/${service?.id}/edit`,
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${service?.name || 'Dental Service'}`} />
      <div className="container p-8 mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Edit Dental Service</h1>
          <p className="text-muted-foreground">
            Update the details for {service?.name}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Update the information for this dental service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DentalServiceForm service={service} isEditing={true} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
