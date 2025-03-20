import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient',
        href: '/patient',
    },
    {
        title: 'Dashboard',
        href: '/patient/dashboard',
    },
];

export default function PatientDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold tracking-tight">Patient Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to Doctor Smile. Manage your dental appointments and view your history here.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Mar 25, 2025</div>
                            <p className="text-xs text-muted-foreground">10:30 AM - Regular Checkup</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                Reschedule
                            </Button>
                        </CardFooter>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Appointment Status</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">Confirmed</div>
                            <p className="text-xs text-muted-foreground">Your appointment is confirmed</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                Cancel Appointment
                            </Button>
                        </CardFooter>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-medium">Feb 12, 2025</div>
                            <p className="text-xs text-muted-foreground">Dental Cleaning</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" size="sm" className="w-full">
                                View History
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Book a New Appointment</CardTitle>
                            <CardDescription>
                                Choose from available time slots to book your next visit
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <div className="font-medium">Select a date</div>
                                    <div className="rounded-md border">
                                        {/* Calendar placeholder */}
                                        <div className="flex h-[250px] items-center justify-center">
                                            <p className="text-sm text-muted-foreground">Calendar component would go here</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="font-medium">Available time slots</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['9:00 AM', '10:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'].map((time, i) => (
                                            <Button key={i} variant="outline" className="justify-start">
                                                <Clock className="mr-2 h-4 w-4" />
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline">Cancel</Button>
                            <Button>Book Appointment</Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>
                                Your scheduled visits
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Regular Checkup</p>
                                        <p className="text-xs text-muted-foreground">Mar 25, 2025 at 10:30 AM</p>
                                        <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                            Confirmed
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">Teeth Whitening</p>
                                        <p className="text-xs text-muted-foreground">Apr 15, 2025 at 2:00 PM</p>
                                        <span className="mt-1 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link" className="px-0">View all appointments</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
