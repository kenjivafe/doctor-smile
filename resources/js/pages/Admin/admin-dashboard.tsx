import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Clock, DollarSign, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to the Doctor Smile admin dashboard. Manage your dental clinic here.
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">127</div>
                            <p className="text-xs text-muted-foreground">+5 from last month</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">3 pending approval</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$4,235</div>
                            <p className="text-xs text-muted-foreground">+12% from last week</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">24m</div>
                            <p className="text-xs text-muted-foreground">-2m from last week</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Appointment Analytics</CardTitle>
                            <CardDescription>
                                Appointment trends for the last 30 days
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {/* Chart would go here - placeholder for now */}
                            <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                                <p className="text-sm text-muted-foreground">Appointment analytics chart</p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Upcoming Appointments</CardTitle>
                            <CardDescription>
                                Next appointments scheduled
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                            <Calendar className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none">Patient {i + 1}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(Date.now() + (i + 1) * 86400000).toLocaleDateString()} at {
                                                    ['9:00 AM', '10:30 AM', '1:15 PM', '3:45 PM', '5:00 PM'][i]
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <button className="text-sm text-primary hover:underline">View all appointments</button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
