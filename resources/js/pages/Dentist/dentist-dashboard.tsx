import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, FileCheck, UserRound, XCircle, RefreshCcw } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Head, usePage, Link } from '@inertiajs/react';
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
        price?: number;
        cost?: number;
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

// Custom scrollbar styles for this component
const scrollbarStyles = `
    .dark .dentist-dashboard ::-webkit-scrollbar-track {
        background: #27272a !important;
        border-radius: 5px;
    }

    .dark .dentist-dashboard ::-webkit-scrollbar-thumb {
        background: #52525b !important;
        border-radius: 5px;
    }

    .dark .dentist-dashboard ::-webkit-scrollbar-thumb:hover {
        background: #71717a !important;
    }

    .dentist-dashboard ::-webkit-scrollbar-track {
        background: #f1f1f1 !important;
        border-radius: 5px;
    }

    .dentist-dashboard ::-webkit-scrollbar-thumb {
        background: #c1c1c1 !important;
        border-radius: 5px;
    }

    .dentist-dashboard ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8 !important;
    }

    .dentist-dashboard ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
`;

export default function DentistDashboard() {
    // Get the page props with proper typing
    const { auth, todaysAppointments, upcomingAppointments, appointmentCounts } = usePage<DentistDashboardProps>().props;

    // Use auth user name as fallback
    const safeDentistName = auth?.user?.name || 'Doctor';

    // Debug to check what data we're actually receiving
    console.log('Dentist Dashboard Props:', {
        auth,
        todaysAppointments: todaysAppointments,
        todaysAppointmentsCount: todaysAppointments?.length,
        upcomingAppointments: upcomingAppointments,
        upcomingAppointmentsCount: upcomingAppointments?.length,
        appointmentCounts,
        sampleAppointment: todaysAppointments && todaysAppointments.length > 0 ? todaysAppointments[0] : null
    });

    // Add null checks and default values to prevent errors
    const safeTodayAppointments = todaysAppointments || [];
    const safeUpcomingAppointments = upcomingAppointments || [];

    // Ensure stats has all required properties with defaults
    const safeStats = {
        appointmentsToday: safeTodayAppointments.length,
        appointmentsUpcoming: safeUpcomingAppointments.length,
        appointmentsCompleted: appointmentCounts?.completed || 0,
        appointmentsCancelled: appointmentCounts?.cancelled || 0
    };

    // Define interface for time slots
    interface TimeSlot {
        time: string;
        datetime: string;
        status: 'available' | 'booked' | 'lunch' | 'unavailable';
        label?: string;
        patient?: string;
        service?: string;
    }

    // Generate time slots for Today's Schedule
    const generateTimeSlots = () => {
        // Create slots from 9 AM to 5 PM with half-hour increments
        const slots: TimeSlot[] = [
            { time: '9:00 AM', datetime: '09:00', status: 'available' },
            { time: '9:30 AM', datetime: '09:30', status: 'available' },
            { time: '10:00 AM', datetime: '10:00', status: 'available' },
            { time: '10:30 AM', datetime: '10:30', status: 'available' },
            { time: '11:00 AM', datetime: '11:00', status: 'available' },
            { time: '11:30 AM', datetime: '11:30', status: 'available' },
            { time: '12:00 PM', datetime: '12:00', status: 'available' },
            { time: '12:30 PM', datetime: '12:30', status: 'available' },
            { time: '1:00 PM', datetime: '13:00', status: 'available' },
            { time: '1:30 PM', datetime: '13:30', status: 'available' },
            { time: '2:00 PM', datetime: '14:00', status: 'available' },
            { time: '2:30 PM', datetime: '14:30', status: 'available' },
            { time: '3:00 PM', datetime: '15:00', status: 'available' },
            { time: '3:30 PM', datetime: '15:30', status: 'available' },
            { time: '4:00 PM', datetime: '16:00', status: 'available' },
            { time: '4:30 PM', datetime: '16:30', status: 'available' },
            { time: '5:00 PM', datetime: '17:00', status: 'available' },
        ];

        // Helper function to convert time string to minutes from midnight
        const timeToMinutes = (hour: number, minute: number) => hour * 60 + minute;

        // Convert slot datetime to minutes for easier comparison
        const slotMinutesMap = slots.map((slot, index) => {
            const [hour, minute] = slot.datetime.split(':').map(part => parseInt(part));
            return {
                index,
                minutes: timeToMinutes(hour, minute || 0)
            };
        });

        // Mark slots as booked based on today's appointments
        safeTodayAppointments.forEach(appointment => {
            // Extract hour and minute directly from the ISO datetime string to avoid timezone issues
            const timeMatch = appointment.appointment_datetime.match(/T(\d{2}):(\d{2})/);
            if (!timeMatch || !timeMatch[1] || !timeMatch[2]) return;

            const hour = parseInt(timeMatch[1]);
            const minute = parseInt(timeMatch[2]);
            const appointmentStartMinutes = timeToMinutes(hour, minute);

            // Default to 30 minutes if duration is not specified
            const duration = appointment.duration_minutes || 30;
            const appointmentEndMinutes = appointmentStartMinutes + duration;

            // Find the primary slot for this appointment
            const mainSlotIndex = slots.findIndex(slot => {
                const slotTime = slot.datetime.split(':');
                const slotHour = parseInt(slotTime[0]);
                const slotMinute = slotTime.length > 1 ? parseInt(slotTime[1]) : 0;

                // Match the exact hour and approximate half-hour (0-29 → :00, 30-59 → :30)
                return slotHour === hour &&
                       ((minute < 30 && slotMinute === 0) ||
                        (minute >= 30 && slotMinute === 30));
            });

            if (mainSlotIndex !== -1) {
                // Mark the primary slot as booked
                slots[mainSlotIndex].status = 'booked';
                slots[mainSlotIndex].patient = appointment.patient?.user?.name || 'Patient';
                slots[mainSlotIndex].service = appointment.dentalService?.name || 'Service';

                // Also mark any overlapping slots as unavailable
                slotMinutesMap.forEach(slotInfo => {
                    if (slotInfo.index !== mainSlotIndex) {
                        const slotMinutes = slotInfo.minutes;
                        const slotEndMinutes = slotMinutes + 30; // Each slot is 30 minutes

                        // Check if this slot overlaps with the appointment
                        const overlapsWithAppointment =
                            (slotMinutes >= appointmentStartMinutes && slotMinutes < appointmentEndMinutes) || // Slot starts during appointment
                            (slotEndMinutes > appointmentStartMinutes && slotEndMinutes <= appointmentEndMinutes) || // Slot ends during appointment
                            (slotMinutes <= appointmentStartMinutes && slotEndMinutes >= appointmentEndMinutes); // Slot contains appointment

                        if (overlapsWithAppointment && slots[slotInfo.index].status === 'available') {
                            slots[slotInfo.index].status = 'unavailable';
                        }
                    }
                });
            }
        });

        return slots;
    };

    const todayTimeSlots = generateTimeSlots();

    // State to track active tab
    const [activeTab, setActiveTab] = React.useState<"today" | "upcoming">("today");

    // Helper function to format time from a timestamp
    const formatTime = (timestamp: string) => {
        if (!timestamp) return '--:--';

        // Parse the ISO datetime string and extract the time portion
        // This avoids timezone issues by using the time as specified in the database
        const timeMatch = timestamp.match(/T(\d{2}):(\d{2})/);
        if (timeMatch) {
            const [, hours, minutes] = timeMatch; // Use comma to skip the first matched item
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12; // Convert 0 to 12 for 12 AM

            return `${hour12}:${minutes} ${ampm}`;
        }

        // Fallback to standard formatting if pattern doesn't match
        return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // Helper function to extract duration in minutes from appointment
    const getDurationText = (appointment: AppointmentData) => {
        if (!appointment.duration_minutes) return '';
        return `(${appointment.duration_minutes} min)`;
    };

    // Helper function to format date from a timestamp
    const formatDate = (timestamp: string) => {
        if (!timestamp) return 'No date';
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
        <>
            {/* Apply custom scrollbar styles */}
            <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dentist Dashboard" />

            <div className="flex flex-col flex-1 p-8 space-y-4 h-full dentist-dashboard">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Welcome, Dr. {safeDentistName}</h2>
                        <p className="text-muted-foreground">
                            Here's an overview of your appointments and schedule
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button onClick={() => window.location.reload()}>
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
                    <Card className="col-span-4">
                        <CardHeader>
                            <div className="flex flex-row justify-between items-center">
                                <CardTitle>Appointments</CardTitle>
                                <div className="flex space-x-2">
                                    <Button
                                        variant={activeTab === "today" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveTab("today")}
                                    >
                                        Today
                                    </Button>
                                    <Button
                                        variant={activeTab === "upcoming" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setActiveTab("upcoming")}
                                    >
                                        Upcoming
                                    </Button>
                                </div>
                            </div>
                            <CardDescription className="mt-[-0.5rem]">
                                {activeTab === "today" ? "Your appointments for today" : "Your upcoming appointments"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`mt-[-0.5rem] space-y-4 ${safeTodayAppointments.length > 5 || safeUpcomingAppointments.length > 5 ? 'max-h-144 overflow-y-auto pr-2' : ''}`}>
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
                                                <p className="text-sm font-medium truncate">{appointment.patient?.user?.name || 'Patient'}</p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Clock className="mr-1 w-4 h-4" />
                                                    {formatTime(appointment.appointment_datetime)} {getDurationText(appointment)}
                                                </div>
                                                <p className="text-sm truncate text-muted-foreground">
                                                    {appointment.dentalService?.name || 'Service'}
                                                </p>
                                            </div>
                                            <Badge variant={getStatusVariant(appointment.status || 'scheduled')}>{appointment.status || 'Scheduled'}</Badge>
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={route('dentist.appointments.show', appointment.id)}>View</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex justify-center py-8 text-muted-foreground dark:text-muted-foreground">
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
                                                <p className="text-sm font-medium truncate">{appointment.patient?.user?.name || 'Patient'}</p>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Calendar className="mr-1 w-4 h-4" />
                                                    {new Date(appointment.appointment_datetime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {formatTime(appointment.appointment_datetime)} {getDurationText(appointment)}
                                                </div>
                                                <p className="text-sm truncate text-muted-foreground">
                                                    {appointment.dentalService?.name || 'Service'}
                                                </p>
                                            </div>
                                            <Badge variant={getStatusVariant(appointment.status || 'scheduled')}>{appointment.status || 'Scheduled'}</Badge>
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={route('dentist.appointments.show', appointment.id)}>View</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex justify-center py-8 text-muted-foreground dark:text-muted-foreground">
                                            No upcoming appointments scheduled
                                        </div>
                                    )
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Today's Schedule</CardTitle>
                            <CardDescription>
                                Your timeslots for today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* 3x6 grid layout for Today's Schedule with half-hour slots */}
                            <div className="grid overflow-y-auto grid-cols-3 gap-2 pr-1 max-h-128">
                                {/* Render dynamic time slots */}
                                {todayTimeSlots.map((slot, index) => (
                                    <div key={index} className="flex flex-col justify-between items-center p-3 h-28 rounded-md border shadow-sm bg-card dark:border-border">
                                        <div className="flex justify-center items-center w-full">
                                            <div className={`flex justify-center items-center mr-2 w-6 h-6 rounded-full ${
                                                slot.status === 'lunch' ? 'bg-muted/20 dark:bg-muted/40' :
                                                slot.status === 'unavailable' ? 'bg-muted-foreground/10 dark:bg-muted-foreground/20' :
                                                'bg-primary/10 dark:bg-primary/20'}`}>
                                                {slot.status === 'booked' ? (
                                                    <UserRound className="w-3 h-3 text-primary dark:text-primary" />
                                                ) : slot.status === 'unavailable' ? (
                                                    <Clock className="w-3 h-3 text-muted-foreground dark:text-muted-foreground" />
                                                ) : (
                                                    <Clock className="w-3 h-3 text-primary dark:text-primary" />
                                                )}
                                            </div>
                                            <p className="text-sm font-medium">{slot.time}</p>
                                        </div>

                                        <div className="flex flex-col flex-grow justify-center items-center">
                                            {/* Patient & service info for booked slots */}
                                            {slot.status === 'booked' && slot.patient && slot.service && (
                                                <div className="px-1 w-full text-center">
                                                    <p className="max-w-full text-xs font-medium truncate text-muted-foreground">{slot.patient}</p>
                                                    <p className="max-w-full text-xs truncate">{slot.service}</p>
                                                </div>
                                            )}

                                            {/* Label for lunch break */}
                                            {slot.status === 'lunch' && (
                                                <p className="text-xs text-center">{slot.label}</p>
                                            )}
                                        </div>

                                        {/* Status badge */}
                                        <div className="w-full text-center">
                                            <Badge
                                                variant={slot.status === 'available' ? "default" :
                                                        slot.status === 'booked' ? "destructive" :
                                                        slot.status === 'unavailable' ? "secondary" : "outline"}
                                                className={`${slot.status === 'available' ? 'bg-primary/10 hover:bg-primary/15 text-primary hover:text-primary dark:bg-primary/20 dark:hover:bg-primary/25 dark:text-primary-foreground dark:hover:text-primary-foreground' :
                                                          slot.status === 'booked' ? 'bg-destructive/10 hover:bg-destructive/15 text-destructive hover:text-destructive dark:bg-destructive/20 dark:hover:bg-destructive/25 dark:text-destructive-foreground dark:hover:text-destructive-foreground' :
                                                          slot.status === 'unavailable' ? 'bg-muted hover:bg-muted text-muted-foreground hover:text-muted-foreground dark:bg-muted/50 dark:hover:bg-muted/60 dark:text-muted-foreground dark:hover:text-muted-foreground' : ''}`}
                                            >
                                                {slot.status === 'available' ? "Available" :
                                                 slot.status === 'booked' ? "Booked" :
                                                 slot.status === 'unavailable' ? "Unavailable" : "Break"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button className="mt-4 w-full" variant="outline" asChild>
                                <Link href={route('dentist.schedule')}>Update Schedule</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
        </>
    );
}
