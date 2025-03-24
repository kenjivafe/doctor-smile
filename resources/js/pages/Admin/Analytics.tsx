import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Analytics',
        href: '/admin/analytics',
    },
];

// Safe default colors for visualizations
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Define proper types for our data
interface AnalyticsData {
    appointmentTrend?: Array<{month: string; count: number}>;
    totalAppointments?: number;
    activePatients?: number;
    revenue?: number;
    growthRates?: {
        appointments: number;
        patients: number;
        revenue: number;
    };
    dentistWorkload?: Array<{dentist_name: string; count: number}>;
    statusDistribution?: Array<{name: string; value: number}>;
}

interface PageProps {
    analyticsData?: AnalyticsData;
}

export default function Analytics() {
    // Safely access page props with proper typing
    const { analyticsData = {} } = usePage().props as PageProps;
    
    // Create safe data objects with fallbacks
    const safeAppointmentTrend = analyticsData.appointmentTrend || [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Apr', count: 0 },
        { month: 'May', count: 0 },
        { month: 'Jun', count: 0 },
    ];
    
    const safeStats = {
        totalAppointments: analyticsData.totalAppointments || 0,
        activePatients: analyticsData.activePatients || 0,
        revenue: analyticsData.revenue || 0,
        growthRates: analyticsData.growthRates || {
            appointments: 0,
            patients: 0,
            revenue: 0
        }
    };
    
    const safeDentistWorkload = analyticsData.dentistWorkload || [];
    const safeStatusDistribution = analyticsData.statusDistribution || [];
    
    return (
        <PageTemplate title="Analytics Dashboard" breadcrumbs={breadcrumbs}>
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Total Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{safeStats.totalAppointments}</div>
                        <p className="text-xs text-muted-foreground">
                            {safeStats.growthRates.appointments > 0 ? '+' : ''}
                            {safeStats.growthRates.appointments}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Active Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{safeStats.activePatients}</div>
                        <p className="text-xs text-muted-foreground">
                            {safeStats.growthRates.patients > 0 ? '+' : ''}
                            {safeStats.growthRates.patients}% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            ${typeof safeStats.revenue === 'number' 
                                ? safeStats.revenue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) 
                                : '0.00'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {safeStats.growthRates.revenue > 0 ? '+' : ''}
                            {safeStats.growthRates.revenue}% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Appointments Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-x-auto">
                            <LineChart 
                                width={500} 
                                height={300} 
                                data={safeAppointmentTrend}
                                margin={{top: 5, right: 30, left: 20, bottom: 5}}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    name="Appointments" 
                                    stroke="#8884d8" 
                                    activeDot={{ r: 8 }} 
                                />
                            </LineChart>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Dentist Workload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-x-auto">
                            {safeDentistWorkload.length > 0 ? (
                                <BarChart
                                    width={500}
                                    height={300}
                                    data={safeDentistWorkload}
                                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="dentist_name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" name="Appointments" fill="#82ca9d" />
                                </BarChart>
                            ) : (
                                <div className="flex h-[300px] items-center justify-center">
                                    <p className="text-muted-foreground">No dentist workload data available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="mt-4">
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader>
                        <CardTitle>Appointment Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full justify-center">
                            {safeStatusDistribution.length > 0 ? (
                                <PieChart width={400} height={300}>
                                    <Pie
                                        data={safeStatusDistribution}
                                        cx={200}
                                        cy={150}
                                        labelLine={true}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {safeStatusDistribution.map((entry: {name: string; value: number}, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} appointments`, 'Count']} />
                                </PieChart>
                            ) : (
                                <div className="flex h-[300px] items-center justify-center">
                                    <p className="text-muted-foreground">No status distribution data available</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageTemplate>
    );
}
