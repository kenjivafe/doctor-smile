import * as React from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardFooter,
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Calendar,
    Clock,
    Mail,
    MapPin,
    Phone,
    Trash2,
    Edit,
    ArrowLeft,
    FileCheck,
    XCircle,
    Briefcase,
    CalendarDays
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConfirm } from '@/hooks/use-confirm';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Dentists',
        href: '/admin/dentists',
    },
    {
        title: 'Dentist Details',
        href: '#',
    },
];

interface AppointmentData {
    id: number;
    patient_name: string;
    service_name: string;
    appointment_datetime: string;
    status: string;
    duration_minutes: number;
    cost: number;
}

interface DentistData {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    bio?: string;
    years_of_experience?: number;
    total_appointments: number;
    completed_appointments: number;
    cancelled_appointments: number;
    revenue: number;
}

interface DentistDetailsProps extends PageProps {
    dentist: DentistData;
    recentAppointments: AppointmentData[];
}

export default function DentistDetails() {
    const { dentist, recentAppointments = [] } = usePage<DentistDetailsProps>().props;
    const { confirm } = useConfirm();

    // Helper function to format date and time
    const formatDateTime = (datetime: string) => {
        const date = new Date(datetime);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Helper function to format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Helper function to get badge variant based on status
    const getStatusVariant = (status: string): "default" | "warning" | "secondary" | "destructive" | "outline" => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'secondary';
            case 'confirmed':
                return 'default';
            case 'cancelled':
                return 'destructive';
            case 'no_show':
                return 'warning';
            default:
                return 'default';
        }
    };

    const handleDeleteDentist = () => {
        confirm({
            title: 'Delete Dentist',
            description: `Are you sure you want to delete ${dentist.name}? This action cannot be undone, and all appointments for this dentist will be affected.`,
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            confirmVariant: 'destructive',
            onConfirm: () => {
                router.delete(route('admin.dentists.destroy', dentist.id));
            }
        });
    };

    // Calculate completion rate
    const completionRate = dentist.total_appointments > 0 
        ? Math.round((dentist.completed_appointments / dentist.total_appointments) * 100)
        : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Dentist: ${dentist.name}`} />

            <div className="flex flex-col flex-1 gap-6 p-8 h-full">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.dentists')}>
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to Dentists
                        </Link>
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.dentists.edit', dentist.id)}>
                                <Edit className="mr-2 w-4 h-4" />
                                Edit Dentist
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteDentist}>
                            <Trash2 className="mr-2 w-4 h-4" />
                            Delete Dentist
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Dentist profile card */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-2">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src="" alt={dentist.name} />
                                    <AvatarFallback className="text-2xl">{dentist.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle className="text-xl">{dentist.name}</CardTitle>
                            <CardDescription>Dentist</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Mail className="mt-0.5 w-4 h-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="text-sm font-medium">{dentist.email}</p>
                                    </div>
                                </div>
                                
                                {dentist.contact_number && (
                                    <div className="flex items-start gap-2">
                                        <Phone className="mt-0.5 w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Phone</p>
                                            <p className="text-sm font-medium">{dentist.contact_number}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {dentist.address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="mt-0.5 w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Address</p>
                                            <p className="text-sm font-medium">{dentist.address}</p>
                                        </div>
                                    </div>
                                )}
                                
                                {dentist.years_of_experience !== undefined && (
                                    <div className="flex items-start gap-2">
                                        <Briefcase className="mt-0.5 w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Experience</p>
                                            <p className="text-sm font-medium">{dentist.years_of_experience} years</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {dentist.bio && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="mb-2 text-sm font-medium">Biography</h3>
                                        <p className="text-sm text-muted-foreground">{dentist.bio}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance metrics */}
                    <div className="space-y-6 md:col-span-2">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{dentist.total_appointments}</div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                                    <FileCheck className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{dentist.completed_appointments}</div>
                                    <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                                    <XCircle className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{dentist.cancelled_appointments}</div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(dentist.revenue)}</div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        {/* Recent appointments */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Appointments</CardTitle>
                                <CardDescription>
                                    The most recent appointments for this dentist
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentAppointments.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentAppointments.map(appointment => (
                                            <div key={appointment.id} className="flex items-center justify-between p-3 rounded-md border">
                                                <div className="flex items-center gap-3">
                                                    <CalendarDays className="w-9 h-9 p-2 text-primary bg-primary/10 rounded-full" />
                                                    <div>
                                                        <p className="text-sm font-medium">{appointment.patient_name}</p>
                                                        <div className="flex items-center text-xs text-muted-foreground">
                                                            <Clock className="mr-1 w-3 h-3" />
                                                            {formatDateTime(appointment.appointment_datetime)}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{appointment.service_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={getStatusVariant(appointment.status)}>{appointment.status}</Badge>
                                                    <p className="text-sm font-medium">{formatCurrency(appointment.cost)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center items-center py-8 text-muted-foreground">
                                        No recent appointments found.
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/admin/appointments?dentist=${dentist.id}`}>
                                        View All Appointments
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
