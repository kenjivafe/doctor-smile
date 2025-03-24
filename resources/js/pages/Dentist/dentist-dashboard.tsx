import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, FileCheck, UserRound, XCircle, RefreshCcw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dentist/dashboard',
    },
];

// Interfaces for type safety
interface AppointmentData {
    id: number;
    patient_id: number;
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
        id: number;
        user: {
            name: string;
            email: string;
        }
        phone_number: string;
    };
    dentalService: {
        name: string;
        price: number;
    };
}

interface AvailabilityData {
    id: number;
    dentist_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    created_at: string;
    updated_at: string;
}

// Define the page props interface
interface DentistDashboardProps extends PageProps {
    auth?: {
        user?: {
            id?: number;
            name?: string;
            email?: string;
        }
    };
    todaysAppointments?: AppointmentData[];
    upcomingAppointments?: AppointmentData[];
    availabilities?: AvailabilityData[];
    appointmentCounts?: {
        scheduled?: number;
        confirmed?: number;
        completed?: number;
        cancelled?: number;
        [key: string]: number | undefined;
    };
    userRole?: string;
}

export default function DentistDashboard() {
    // Get the page props with proper typing
    const { auth, todaysAppointments, upcomingAppointments, availabilities, appointmentCounts } = usePage<DentistDashboardProps>().props;

    // Use auth user name as fallback
    const safeDentistName = auth?.user?.name || 'Doctor';

    // Debug to check what data we're actually receiving
    console.log('Dentist Dashboard Props:', {
        auth,
        todaysAppointmentsCount: todaysAppointments?.length,
        appointmentCounts
    });

    // Add null checks and default values to prevent errors
    const safeTodayAppointments = todaysAppointments || [];
    const safeUpcomingAppointments = upcomingAppointments || [];
    const safeAvailabilityData = availabilities || [];

    // Ensure stats has all required properties with defaults
    const safeStats = {
        appointmentsToday: safeTodayAppointments.length,
        appointmentsUpcoming: safeUpcomingAppointments.length,
        appointmentsCompleted: appointmentCounts?.completed || 0,
        appointmentsCancelled: appointmentCounts?.cancelled || 0
    };

    // State to track active tab - we'll use simple state management instead of a tabs component
    const activeTab = "today" as "today" | "upcoming"; // This could be state-managed in a real implementation

    // Helper function to format time from a timestamp
    const formatTime = (timestamp: string) => {
        if (!timestamp) return '--:--';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper function to format date from a timestamp
    const formatDate = (timestamp: string) => {
        if (!timestamp) return 'No date';
        return new Date(timestamp).toLocaleDateString();
    };

    // Helper function to get the day name from a day number (0-6)
    const getDayName = (day: number) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day] || 'Unknown';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dentist Dashboard" />

            <div className="flex flex-col flex-1 p-8 space-y-8 h-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Welcome back, Dr. {safeDentistName}</h2>
                        <p className="text-muted-foreground">
                            Here's an overview of your appointments and schedule
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button>
                            <RefreshCcw className="mr-2 w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeStats.appointmentsToday}</div>
                            <p className="text-xs text-muted-foreground">
                                {safeTodayAppointments.length > 0 ? `Next: ${formatTime(safeTodayAppointments[0]?.appointment_datetime)}` : 'No appointments today'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeStats.appointmentsUpcoming}</div>
                            <p className="text-xs text-muted-foreground">
                                {safeUpcomingAppointments.length > 0 ? `Next: ${formatDate(safeUpcomingAppointments[0]?.appointment_datetime)}` : 'No upcoming appointments'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                            <FileCheck className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeStats.appointmentsCompleted}</div>
                            <p className="text-xs text-muted-foreground">appointments completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeStats.appointmentsCancelled}</div>
                            <p className="text-xs text-muted-foreground">appointments cancelled</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <div className="flex flex-row justify-between items-center">
                                <CardTitle>Appointments</CardTitle>
                                <div className="flex space-x-2">
                                    <Button variant={activeTab === "today" ? "default" : "outline"} size="sm">
                                        Today
                                    </Button>
                                    <Button variant={activeTab === "upcoming" ? "default" : "outline"} size="sm">
                                        Upcoming
                                    </Button>
                                </div>
                            </div>
                            <CardDescription>
                                {activeTab === "today" ? "Your appointments for today" : "Your upcoming appointments"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activeTab === "today" ? (
                                    safeTodayAppointments.length > 0 ? safeTodayAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-center p-4 space-x-4 rounded-md border">
                                            <Avatar>
                                                <AvatarImage src="" />
                                                <AvatarFallback>
                                                    <UserRound className="w-5 h-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">{appointment.patient?.user?.name || 'Patient'}</p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Clock className="mr-1 w-4 h-4" />
                                                    {formatTime(appointment.appointment_datetime)} ({appointment.duration_minutes || 30} min)
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.dentalService?.name || 'Service'}
                                                </p>
                                            </div>
                                            <Badge variant={getStatusVariant(appointment.status || 'scheduled')}>{appointment.status || 'Scheduled'}</Badge>
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="outline">Update</Button>
                                                <Button size="sm" variant="outline">Complete</Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex justify-center py-8 text-muted-foreground">
                                            No appointments scheduled for today
                                        </div>
                                    )
                                ) : (
                                    safeUpcomingAppointments.length > 0 ? safeUpcomingAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex items-center p-4 space-x-4 rounded-md border">
                                            <Avatar>
                                                <AvatarImage src="" />
                                                <AvatarFallback>
                                                    <UserRound className="w-5 h-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">{appointment.patient?.user?.name || 'Patient'}</p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="mr-1 w-4 h-4" />
                                                    {formatDate(appointment.appointment_datetime)} {formatTime(appointment.appointment_datetime)}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {appointment.dentalService?.name || 'Service'}
                                                </p>
                                            </div>
                                            <Badge variant={getStatusVariant(appointment.status || 'scheduled')}>{appointment.status || 'Scheduled'}</Badge>
                                            <Button size="sm" variant="outline">Reschedule</Button>
                                        </div>
                                    )) : (
                                        <div className="flex justify-center py-8 text-muted-foreground">
                                            No upcoming appointments scheduled
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Weekly Availability</CardTitle>
                            <CardDescription>
                                Your scheduled working hours
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {safeAvailabilityData.length > 0 ? safeAvailabilityData.map((slot) => (
                                    <div key={slot.id} className="flex items-center p-4 space-x-4 rounded-md border">
                                        <div className="flex justify-center items-center w-8 h-8 rounded bg-primary/10">
                                            <Calendar className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{getDayName(slot.day_of_week)}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {slot.is_available ?
                                                    `${slot.start_time || '00:00'} - ${slot.end_time || '00:00'}` :
                                                    'Not Available'
                                                }
                                            </p>
                                        </div>
                                        <Badge variant={slot.is_available ? "default" : "outline"}>
                                            {slot.is_available ? "Available" : "Unavailable"}
                                        </Badge>
                                        <Button size="sm" variant="outline">Edit</Button>
                                    </div>
                                )) : (
                                    <div className="flex justify-center py-8 text-muted-foreground">
                                        No availability data found
                                    </div>
                                )}
                            </div>
                            <Button className="mt-4 w-full" variant="outline">
                                Update Availability
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
