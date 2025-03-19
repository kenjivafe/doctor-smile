import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
    },
];

const data = [
    { month: 'Jan', appointments: 40 },
    { month: 'Feb', appointments: 45 },
    { month: 'Mar', appointments: 55 },
    { month: 'Apr', appointments: 50 },
    { month: 'May', appointments: 60 },
    { month: 'Jun', appointments: 65 },
];

export default function Analytics() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Total Appointments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">315</div>
                            <p className="text-xs text-muted-foreground">+12% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Active Patients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">124</div>
                            <p className="text-xs text-muted-foreground">+5% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader>
                            <CardTitle>Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">$12,450</div>
                            <p className="text-xs text-muted-foreground">+8% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border flex-1">
                    <CardHeader>
                        <CardTitle>Appointments Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-x-auto">
                            <LineChart width={800} height={400} data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="appointments" 
                                    stroke="currentColor"
                                    className="stroke-primary" 
                                />
                            </LineChart>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
