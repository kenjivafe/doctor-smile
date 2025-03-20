import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Calendar, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dentist',
        href: '/dentist',
    },
    {
        title: 'Dashboard',
        href: '/dentist/dashboard',
    },
];

export default function DentistDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dentist Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold tracking-tight">Dentist Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to your Doctor Smile dashboard. Manage your appointments and patient records here.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">8</div>
                            <p className="text-xs text-muted-foreground">2 pending approval</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Your Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">42</div>
                            <p className="text-xs text-muted-foreground">3 new this month</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">126</div>
                            <p className="text-xs text-muted-foreground">This month</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Next Available Slot</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">2:30 PM</div>
                            <p className="text-xs text-muted-foreground">Today</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Today's Schedule</CardTitle>
                            <CardDescription>
                                Your appointments for today
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium">Patient {i + 1}</p>
                                                <span className="text-xs font-medium">
                                                    {['9:00 AM', '10:30 AM', '1:15 PM', '3:45 PM', '5:00 PM'][i]}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {['Regular checkup', 'Tooth extraction', 'Root canal', 'Cleaning', 'Consultation'][i]}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="sr-only">Approve</span>
                                            </button>
                                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                                <XCircle className="h-4 w-4" />
                                                <span className="sr-only">Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <button className="text-sm text-primary hover:underline">View full schedule</button>
                        </CardFooter>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Approvals</CardTitle>
                            <CardDescription>
                                Appointments awaiting your approval
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex items-start gap-4 rounded-lg border p-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">New Patient {i + 1}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString()} at {
                                                    ['11:00 AM', '2:30 PM', '4:15 PM'][i]
                                                }
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {['First consultation', 'Tooth pain', 'Regular checkup'][i]}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="sr-only">Approve</span>
                                            </button>
                                            <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                                <XCircle className="h-4 w-4" />
                                                <span className="sr-only">Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <button className="text-sm text-primary hover:underline">Manage availability</button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
