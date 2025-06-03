import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, FileCheck, CalendarCheck, UserRound, CreditCard, Info } from 'lucide-react';
import { Head, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Types for the patient dashboard props
interface PatientDashboardProps extends PageProps {
    auth?: {
        user?: {
            id?: number;
            name?: string;
            email?: string;
        }
    };
    patientDetails?: {
        id?: number;
        name?: string;
        email?: string;
        phone_number?: string;
        address?: string;
        date_of_birth?: string;
        user_id?: number;
        created_at?: string;
        updated_at?: string;
        balance?: number | null; // Add null to the type
        suggested_next_appointment?: string;
        next_appointment_reason?: string;
    };
    appointments?: Array<{
        id: number;
        dentist?: {
            id?: number;
            user?: {
                id?: number;
                name?: string;
                email?: string;
            }
        };
        dentalService?: {
            id?: number;
            name?: string;
            description?: string;
            duration_minutes?: number;
            cost?: number;
        };
        appointment_datetime?: string;
        duration_minutes?: number;
        status?: string;
        notes?: string;
        cost?: number;
        dentist_name?: string;
        service_name?: string;
    }>;
    nextAppointment?: {
        id?: number;
        dentist?: {
            id?: number;
            user?: {
                id?: number;
                name?: string;
                email?: string;
            }
        };
        dentalService?: {
            id?: number;
            name?: string;
            description?: string;
            duration_minutes?: number;
            cost?: number;
        };
        appointment_datetime?: string;
        duration_minutes?: number;
        status?: string;
        notes?: string;
    };
    dentalServices?: Array<{
        id: number;
        name: string;
        description: string;
        duration_minutes: number;
        cost: number;
    }>;
    missingPatientRecord?: boolean;
    userRole?: string;
}

// Breadcrumb configuration
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Dashboard',
        href: '/patient/dashboard',
    },
];

// Helper function to determine badge variant based on appointment status
const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'warning' | 'outline' => {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'secondary';
        case 'confirmed':
            return 'default'; // Will be handled as primary in UI
        case 'pending':
            return 'warning';
        case 'suggested':
            return 'warning';
        case 'cancelled':
            return 'destructive';
        case 'no_show':
            return 'destructive';
        default:
            return 'warning';
    }
};

// Helper function to format time from a timestamp
const formatTime = (timestamp?: string) => {
    if (!timestamp) return '--:--';
    try {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '--:--';
    }
};

// Helper function to format date from a timestamp
const formatDate = (timestamp?: string) => {
    if (!timestamp) return 'No date';
    try {
        return new Date(timestamp).toLocaleDateString();
    } catch {
        return 'Invalid date';
    }
};

export default function PatientDashboard() {
    // Get page props with proper typing and safety checks
    const {
        patientDetails,
        appointments,
        nextAppointment,
        missingPatientRecord,
        auth
    } = usePage<PatientDashboardProps>().props;

    // Extract data with default values for safety
    const safePatientDetails = patientDetails || {};
    const safeAppointments = appointments || [];

    // Extract patient data with defaults
    // Use auth.user.name if available, fallback to patientDetails.name, then to 'Patient'
    const patientName = auth?.user?.name || safePatientDetails.name || 'Patient';

    // Helper to safely get nested object properties
    const getNextAppointmentData = () => {
    // Prefer suggested_next_appointment from patientDetails if present
    if (safePatientDetails.suggested_next_appointment) {
        return {
            dentistName: '', // Not available from patientDetails
            serviceName: '', // Not available from patientDetails
            dateTime: safePatientDetails.suggested_next_appointment,
            reason: safePatientDetails.next_appointment_reason || '',
            hasAppointment: true
        };
    }
    if (!nextAppointment) return {
        dentistName: '',
        serviceName: '',
        dateTime: '',
        reason: '',
        hasAppointment: false
    };
    return {
        dentistName: nextAppointment.dentist?.user?.name || '',
        serviceName: nextAppointment.dentalService?.name || '',
        dateTime: nextAppointment.appointment_datetime || '',
        reason: nextAppointment.notes || '',
        hasAppointment: !!nextAppointment.appointment_datetime
    };
};

    const nextAppointmentData = getNextAppointmentData();

    // Calculate profile completion percentage
    const calculateProfileCompletion = () => {
        // Fields that should be filled for a complete profile
        const requiredFields = [
            'name',
            'email',
            'phone_number',
            'address',
            'date_of_birth',
            'gender'
        ] as const;

        type ProfileField = typeof requiredFields[number];

        // Count how many fields are filled
        let filledFields = 0;
        requiredFields.forEach(field => {
            // Use type assertion with a more specific record type
            if ((safePatientDetails as Record<ProfileField, unknown>)[field]) filledFields++;
        });

        // Calculate percentage
        return Math.round((filledFields / requiredFields.length) * 100);
    };

    const profileCompletionPercentage = calculateProfileCompletion();

    // Create a more type-safe way to access patient details
    const getPatientDetail = (field: keyof typeof safePatientDetails) => {
        return safePatientDetails[field];
    };

    // Helper to check if user is new (no appointments)
    const isNewUser = () => {
        return !appointments || appointments.length === 0;
    };

    // Helper to check if balance is zero
    const isBalanceZero = () => {
        const balance = getPatientDetail('balance');
        return balance === 0 || balance === undefined || balance === null;
    };

    // Helper to format the balance
    const formatBalance = () => {
        const balance = getPatientDetail('balance');
        return `₱${parseFloat(String(balance || 0)).toFixed(2)}`;
    };

    // Helper to get appropriate balance display message
    const getBalanceDisplayText = () => {
        if (isNewUser() && isBalanceZero()) {
            return "No Bills Yet";
        } else if (isBalanceZero()) {
            return "Paid in Full";
        } else {
            return formatBalance();
        }
    };

    // Helper to get appropriate balance description
    const getBalanceDescription = () => {
        if (isNewUser() && isBalanceZero()) {
            return "Welcome to Doctor Smile";
        } else if (isBalanceZero()) {
            return "No outstanding payments";
        } else {
            return "Remaining amount due for treatments";
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Dashboard" />
            <div className="flex flex-col flex-1 p-8 space-y-4 h-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Welcome, {patientName}!</h2>
                        <p className="text-muted-foreground">
                            Here's your dental health overview and upcoming appointments.
                        </p>
                    </div>
                </div>

                {missingPatientRecord && (
                    <div className="p-4 mb-4 bg-amber-50 border-l-4 border-amber-500">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-amber-700">
                                    Your patient profile is incomplete. Some features may be limited. Please contact the clinic to update your information.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
                            <UserRound className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{profileCompletionPercentage}%</div>
                            <div className="mt-2 w-full h-2 rounded-full bg-primary/20">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${profileCompletionPercentage}%` }}
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={route('profile.edit')}>
                                    {profileCompletionPercentage < 100 ? 'Complete Profile' : 'View Profile'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Appointment History</CardTitle>
                            <FileCheck className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{safeAppointments.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {safeAppointments.filter(appointment => appointment.status === 'completed').length} completed, {safeAppointments.filter(appointment => appointment.status === 'cancelled').length} cancelled
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href="/patient/appointments">View History</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="flex flex-col h-full">
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Next Suggested Visit</CardTitle>
                            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="flex flex-col flex-1 justify-start">
                            <div className="text-2xl font-bold">
                                {nextAppointmentData.dateTime ? formatDate(nextAppointmentData.dateTime) : 'None scheduled'}
                            </div>
                            {nextAppointmentData.reason && (
                                <p className="text-xs text-muted-foreground">{nextAppointmentData.reason}</p>
                            )}
                            {(nextAppointmentData.dentistName || nextAppointmentData.serviceName) && (
                                <p className="text-xs text-muted-foreground">
                                    {nextAppointmentData.dentistName && <>Dr. {nextAppointmentData.dentistName}</>}{nextAppointmentData.dentistName && nextAppointmentData.serviceName && ' · '}{nextAppointmentData.serviceName}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter className="mt-auto">
                            <Button variant="outline" size="sm" className="w-full" asChild>
                                <Link href={route('patient.book-appointment')}>Book Now</Link>
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {getBalanceDisplayText()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {getBalanceDescription()}
                            </p>
                        </CardContent>
                        <CardFooter>
                                {/* Payment info message instead of Pay Now button */}
                                {isBalanceZero() ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        disabled
                                    >
                                        No Payments Due
                                    </Button>
                                ) : (
                                    <div className="flex gap-1 justify-center items-center py-2 w-full text-xs text-center text-muted-foreground">
                                        <span className="inline-flex relative items-center">
  <Info className="inline w-3 h-3 text-muted-foreground/70" aria-label="Info" />
  <span className="sr-only">Please pay at the clinic reception.</span>
</span>
Payments are handled at the clinic.
</div>
                                )}
                        </CardFooter>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Today's Appointments</CardTitle>
                            <CardDescription>
                                {safeAppointments.length === 0
                                    ? 'You have no appointments scheduled for today'
                                    : `You have ${safeAppointments.length} appointment${safeAppointments.length > 1 ? 's' : ''} today`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {safeAppointments.length > 0 ? (
                                    safeAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex flex-col p-4 space-y-2 rounded-lg border">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                                    <div className="font-medium">{formatTime(appointment.appointment_datetime)}</div>
                                                </div>
                                                <Badge variant={getStatusVariant(appointment.status || 'pending')}>
                                                    {appointment.status || 'Pending'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {appointment.service_name || appointment.dentalService?.name || 'Dental service'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {appointment.dentist_name || (appointment.dentist?.user?.name ? `Dr. ${appointment.dentist.user.name}` : 'Doctor')} · {appointment.duration_minutes || 30} min
                                            </div>
                                            {appointment.notes && (
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium">Notes:</span> {appointment.notes}
                                                </div>
                                            )}
                                            <div className="flex justify-between pt-2">
                                                <div className="font-medium">
                                                    ₱{parseFloat(String(appointment.cost || appointment.dentalService?.cost || 0)).toFixed(2)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={route('patient.appointments.show', appointment.id)}>View</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col justify-center items-center p-8 text-center rounded-lg border border-dashed">
                                        <CalendarDays className="mb-2 w-10 h-10 text-muted-foreground" />
                                        <h3 className="mb-1 font-medium">No Appointments Today</h3>
                                        <p className="text-sm text-muted-foreground">
                                            You don't have any appointments scheduled for today.
                                        </p>
                                        <Button className="mt-4" size="sm" asChild>
                                            <Link href={route('patient.book-appointment')}>Book Appointment</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>
                                {safeAppointments.length === 0
                                    ? 'You have no upcoming appointments'
                                    : `Your next ${safeAppointments.length} upcoming appointment${safeAppointments.length > 1 ? 's' : ''}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {safeAppointments.length > 0 ? (
                                    safeAppointments.map((appointment) => (
                                        <div key={appointment.id} className="flex flex-col p-4 space-y-2 rounded-lg border">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center space-x-2">
                                                    <CalendarDays className="w-4 h-4 text-muted-foreground" />
                                                    <div className="font-medium">{formatDate(appointment.appointment_datetime)}</div>
                                                </div>
                                                <Badge variant={getStatusVariant(appointment.status || 'pending')}>
                                                    {appointment.status || 'Pending'}
                                                </Badge>
                                            </div>
                                            <div className="text-sm font-medium">
                                                {appointment.service_name || appointment.dentalService?.name || 'Dental service'}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {appointment.dentist_name || (appointment.dentist?.user?.name ? `Dr. ${appointment.dentist.user.name}` : 'Doctor')} · {formatTime(appointment.appointment_datetime)} · {appointment.duration_minutes || 30} min
                                            </div>
                                            <div className="flex justify-between pt-2">
                                                <div className="font-medium">
                                                    ₱{parseFloat(String(appointment.cost || appointment.dentalService?.cost || 0)).toFixed(2)}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={route('patient.appointments.show', appointment.id)}>View</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col justify-center items-center p-8 text-center rounded-lg border border-dashed">
                                        <CalendarDays className="mb-2 w-10 h-10 text-muted-foreground" />
                                        <h3 className="mb-1 font-medium">No Upcoming Appointments</h3>
                                        <p className="text-sm text-muted-foreground">
                                            You don't have any appointments scheduled in the near future.
                                        </p>
                                        <Button className="mt-4" size="sm" asChild>
    <Link href={route('patient.book-appointment')}>Book Appointment</Link>
</Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
