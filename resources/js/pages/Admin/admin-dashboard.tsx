import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Clock, DollarSign, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

// Define types for our data
interface AppointmentData {
    id: number;
    patient_id: number;
    dentist_id: number;
    dental_service_id: number;
    appointment_datetime: string;
    duration_minutes: number;
    status: string;
    notes: string | null;
    treatment_notes: string | null;
    cost: number;
    cancellation_reason: string | null;
    created_at: string;
    updated_at: string;
    patient: {
        user: {
            name: string;
        };
    };
    dentist: {
        name: string;
    };
    dentalService: {
        name: string;
        price: number;
    };
}

interface AdminDashboardProps extends PageProps {
    stats?: {
        totalPatients?: number;
        totalAppointments?: number;
        upcomingAppointments?: number;
        revenues?: number | string;
    };
    recentAppointments?: AppointmentData[];
    statusDistribution?: Record<string, number>;
    dentistWorkload?: Array<{
        dentist_name: string;
        count: number;
    }>;
    userRole: string;
}

export default function AdminDashboard() {
    // Get the page props with proper typing
    const {
        stats,
        recentAppointments,
        statusDistribution,
        dentistWorkload
    } = usePage<AdminDashboardProps>().props;

    // Add default values to prevent errors
    const safeStats = {
        totalPatients: stats?.totalPatients || 0,
        totalAppointments: stats?.totalAppointments || 0,
        upcomingAppointments: stats?.upcomingAppointments || 0,
        revenues: stats?.revenues || 0
    };

    const safeRecentAppointments = recentAppointments || [];
    const safeStatusDistribution = statusDistribution || {};
    const safeDentistWorkload = dentistWorkload || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col flex-1 gap-4 p-4 h-full">
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to the Doctor Smile admin dashboard. Manage your dental clinic here.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeStats.totalPatients}</div>
                            <p className="text-xs text-muted-foreground">Registered patients</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeStats.totalAppointments}</div>
                            <p className="text-xs text-muted-foreground">{safeStats.upcomingAppointments} upcoming</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₱ {parseFloat(String(safeStats.revenues)).toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">From completed appointments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Dentist Workload</CardTitle>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeDentistWorkload.length}</div>
                            <p className="text-xs text-muted-foreground">Active dentists</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Appointment Status</CardTitle>
                            <CardDescription>
                                Current appointment distribution
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <div className="space-y-4">
                                {Object.entries(safeStatusDistribution).map(([status, count]) => (
                                    <div key={status} className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColorClass(status)}`} />
                                            <p className="text-sm font-medium capitalize">{status}</p>
                                        </div>
                                        <p className="text-sm font-medium">{count}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Appointments</CardTitle>
                            <CardDescription>
                                Most recently created appointments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {safeRecentAppointments.map((appointment) => (
                                    <div key={appointment.id} className="flex gap-4 items-center">
                                        <div className="flex justify-center items-center w-9 h-9 rounded-full bg-primary/10">
                                            <Calendar className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {appointment.patient.user.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(appointment.appointment_datetime).toLocaleDateString()} at {' '}
                                                {new Date(appointment.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className={`text-xs font-medium capitalize ${getStatusTextClass(appointment.status)}`}>
                                            {appointment.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

// Helper function to get status color for the background
function getStatusColorClass(status: string): string {
    switch (status) {
        case 'scheduled':
            return 'bg-blue-500';
        case 'confirmed':
            return 'bg-green-500';
        case 'completed':
            return 'bg-emerald-500';
        case 'cancelled':
            return 'bg-red-500';
        case 'no_show':
            return 'bg-amber-500';
        default:
            return 'bg-gray-500';
    }
}

// Helper function to get status color for text
function getStatusTextClass(status: string): string {
    switch (status) {
        case 'scheduled':
            return 'text-blue-500';
        case 'confirmed':
            return 'text-green-500';
        case 'completed':
            return 'text-emerald-500';
        case 'cancelled':
            return 'text-red-500';
        case 'no_show':
            return 'text-amber-500';
        default:
            return 'text-gray-500';
    }
}
