import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Wallet } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';

interface AppointmentData {
    id: number;
    dentist_name: string;
    service_name: string;
    appointment_datetime: string;
    status: string;
    duration_minutes: number;
    cost: number;
}

interface PatientData {
    id: number;
    name: string;
    email?: string;
    phone_number?: string;
    address?: string;
    gender?: string;
    date_of_birth?: string;
    balance?: number;
    totalAppointments?: number;
    completedAppointments?: number;
    cancelledAppointments?: number;
    totalSpent?: number;
}

interface PatientDetailsProps {
    patient: PatientData;
    recentAppointments?: AppointmentData[];
}


export default function PatientDetails({ patient, recentAppointments = [] }: PatientDetailsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Patients',
            href: '/admin/patients',
        },
        {
            title: patient.name,
            href: `/admin/patients/${patient.id}`,
        }
    ];

    // Convert date of birth to age
    const getAge = (dateOfBirth?: string) => {
        if (!dateOfBirth) return 'N/A';
        const dob = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return `${age} years`;
    };

    // Format date for display
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Define columns for the appointments table
    const appointmentColumns: ColumnDef<AppointmentData>[] = [
        {
            accessorKey: 'appointment_datetime',
            header: 'Date & Time',
            cell: ({ row }) => {
                const datetime = row.getValue('appointment_datetime') as string;
                const date = new Date(datetime);
                return (
                    <div>
                        <div className="font-medium">
                            {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'service_name',
            header: 'Service',
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue('service_name')}</div>
            ),
        },
        {
            accessorKey: 'dentist_name',
            header: 'Dentist',
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue('dentist_name')}</div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
                
                switch (status) {
                    case 'completed':
                        badgeVariant = 'default';
                        break;
                    case 'scheduled':
                    case 'confirmed':
                        badgeVariant = 'secondary';
                        break;
                    case 'cancelled':
                    case 'no_show':
                        badgeVariant = 'destructive';
                        break;
                }
                
                return (
                    <Badge variant={badgeVariant}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'cost',
            header: 'Cost',
            cell: ({ row }) => {
                const cost = row.getValue('cost') as number;
                return (
                    <div className="text-right font-medium">
                        ₱{cost.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${patient.name} - Patient Details`} />

            <div className="flex flex-col flex-1 gap-4 p-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Patient Details</h2>
                        <p className="text-muted-foreground">
                            View and manage patient information and appointment history.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/patients">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Back to Patients
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('admin.edit-patient', patient.id)}>
                                <Edit className="mr-2 w-4 h-4" />
                                Edit Patient
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Patient Info Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Patient Information</CardTitle>
                            <CardDescription>Personal and contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="flex flex-col items-center text-center space-y-2">
                                <Avatar className="w-24 h-24">
                                    <AvatarFallback className="text-2xl">
                                        {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{patient.name}</h3>
                                    <p className="text-muted-foreground">
                                        {patient.gender ? `${patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}, ` : ''}
                                        {getAge(patient.date_of_birth)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Mail className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Email</p>
                                        <p>{patient.email || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Phone className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Phone</p>
                                        <p>{patient.phone_number || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">Date of Birth</p>
                                        <p>{formatDate(patient.date_of_birth)}</p>
                                    </div>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="text-sm font-medium mb-1">Address</p>
                                    <p className="text-sm">{patient.address || 'No address on file'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats and Appointments Card */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Patient Overview</CardTitle>
                            <CardDescription>Appointment history and financial summary</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Total Appointments</p>
                                    <p className="text-2xl font-bold">{patient.totalAppointments || 0}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">{patient.completedAppointments || 0}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Cancelled</p>
                                    <p className="text-2xl font-bold">{patient.cancelledAppointments || 0}</p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <div className="flex items-center space-x-1">
                                        <Wallet className="w-4 h-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Balance</p>
                                    </div>
                                    <p className={`text-2xl font-bold ${(patient.balance || 0) > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                        ₱{(patient.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Tabs defaultValue="appointments">
                                    <TabsList>
                                        <TabsTrigger value="appointments">Appointments</TabsTrigger>
                                        <TabsTrigger value="billing">Billing History</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="appointments" className="pt-4">
                                        <h3 className="text-lg font-medium mb-4">Recent Appointments</h3>
                                        {recentAppointments && recentAppointments.length > 0 ? (
                                            <DataTable 
                                                columns={appointmentColumns} 
                                                data={recentAppointments} 
                                            />
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>No appointment history found.</p>
                                            </div>
                                        )}
                                    </TabsContent>
                                    <TabsContent value="billing" className="pt-4">
                                        <h3 className="text-lg font-medium mb-2">Billing Summary</h3>
                                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg mb-4">
                                            <div>
                                                <p className="font-medium">Total Spent</p>
                                                <p className="text-muted-foreground">Lifetime value</p>
                                            </div>
                                            <p className="text-2xl font-bold">
                                                ₱{(patient.totalSpent || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div className="text-center py-4 text-muted-foreground">
                                            <p>Detailed billing history is currently being developed.</p>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between border-t pt-4">
                            <p className="text-sm text-muted-foreground">
                                Patient since: {formatDate(patient.date_of_birth ? new Date(new Date(patient.date_of_birth).getFullYear() + 18, 0, 1).toISOString() : undefined)}
                            </p>
                            <Button variant="outline" asChild>
                                <Link href="/admin/appointments">
                                    View All Appointments
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
