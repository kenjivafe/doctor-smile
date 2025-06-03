import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Head, usePage } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { CalendarDays, Clock, Users, Activity, CheckCircle2, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Safe default colors for visualizations
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Define proper types for our data
interface AnalyticsData {
    appointmentTrend: Array<{month: string; count: number}>;
    statusDistribution: Array<{name: string; value: number}>;
    serviceCategoryDistribution: Array<{name: string; value: number}>;
    peakHours: Array<{name: string; value: number}>;
    weekdayDistribution: Array<{name: string; value: number}>;
    dentistWorkload: Array<{dentist_name: string; count: number}>;
    summary: {
        totalAppointments: number;
        activePatients: number;
        newPatientsThisMonth?: number;
        totalDentists: number;
        totalServices: number;
        completionRate: number;
        totalRevenue?: number;
        avgAppointmentDuration?: number;
    };
}

// Extend the Inertia PageProps with our custom props
interface PageProps extends InertiaPageProps {
    analyticsData: AnalyticsData;
    userRole: string;
    [key: string]: unknown; // Add index signature for Inertia compatibility
}

// Define types for chart label functions
type PieChartLabelType = {
    name?: string;
    percent?: number;
}

export default function Analytics() {
    const { props } = usePage<PageProps>();
    const [activeTab, setActiveTab] = useState<string>("trends");

    // Default data to prevent undefined errors
    const defaultAnalyticsData: AnalyticsData = {
        appointmentTrend: [],
        statusDistribution: [],
        serviceCategoryDistribution: [],
        peakHours: [],
        weekdayDistribution: [],
        dentistWorkload: [],
        summary: {
            totalAppointments: 0,
            activePatients: 0,
            newPatientsThisMonth: 0,
            totalDentists: 0,
            totalServices: 0,
            completionRate: 0,
            totalRevenue: 0
        }
    };

    // Use data from props or fallback to defaults
    const analyticsData = props.analyticsData || defaultAnalyticsData;

    const data = {
        appointmentTrend: analyticsData.appointmentTrend || [],
        statusDistribution: analyticsData.statusDistribution || [],
        serviceCategoryDistribution: analyticsData.serviceCategoryDistribution || [],
        peakHours: analyticsData.peakHours || [],
        weekdayDistribution: analyticsData.weekdayDistribution || [],
        dentistWorkload: analyticsData.dentistWorkload || [],
        summary: {
            totalAppointments: analyticsData.summary?.totalAppointments || 0,
            activePatients: analyticsData.summary?.activePatients || 0,
            newPatientsThisMonth: analyticsData.summary?.newPatientsThisMonth || 0,
            totalDentists: analyticsData.summary?.totalDentists || 0,
            totalServices: analyticsData.summary?.totalServices || 0,
            completionRate: analyticsData.summary?.completionRate || 0,
            totalRevenue: analyticsData.summary?.totalRevenue || 0,
            avgAppointmentDuration: analyticsData.summary?.avgAppointmentDuration || 0
        }
    };

    // Calculate growth rates (can be enhanced with historical data in the future)
    const growthRates = {
        appointments: 0, // Can be calculated with historical data
        patients: 0,    // Can be calculated with historical data
        newPatients: 0, // Can be calculated with historical data
        revenue: 0      // Can be calculated with historical data
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Analytics',
            href: '/admin/analytics',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics Dashboard" />
            <div className="container p-4 mx-auto">
                <h1 className="mb-6 text-2xl font-bold">Analytics Dashboard</h1>

                {/* Summary Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3 lg:grid-cols-6">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Total Appointments
                            </CardTitle>
                            <Activity className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.summary.totalAppointments}</div>
                            <p className="text-xs text-muted-foreground">
                                {growthRates.appointments > 0 ? `+${growthRates.appointments}% from last month` : 'No change'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.summary.activePatients}</div>
                            <p className="text-xs text-muted-foreground">
                                {growthRates.patients > 0 ? `+${growthRates.patients}% from last month` : 'No change'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">New Patients</CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.summary.newPatientsThisMonth}</div>
                            <p className="text-xs text-muted-foreground">
                                {growthRates.newPatients > 0 ? `+${growthRates.newPatients}% from last month` : 'No change'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Dentists</CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.summary.totalDentists}</div>
                            <p className="text-xs text-muted-foreground">
                                {data.summary.totalServices} services available
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${data.summary.totalRevenue.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground">
                                {growthRates.revenue > 0 ? `+${growthRates.revenue}% from last month` : 'This month'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.summary.completionRate.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">
                                of appointments completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Analytics Content */}
                <div className="mb-6">
                    <div className="inline-flex justify-center items-center p-1 mb-4 h-10 rounded-md bg-muted text-muted-foreground">
                        <button
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'trends' ? 'bg-background text-foreground shadow-sm' : ''}`}
                            onClick={() => setActiveTab('trends')}
                        >
                            Trends
                        </button>
                        <button
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-background text-foreground shadow-sm' : ''}`}
                            onClick={() => setActiveTab('services')}
                        >
                            Services
                        </button>
                        <button
                            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${activeTab === 'scheduling' ? 'bg-background text-foreground shadow-sm' : ''}`}
                            onClick={() => setActiveTab('scheduling')}
                        >
                            Scheduling
                        </button>
                    </div>

                    {/* Tab Content - Trends */}
                    {activeTab === 'trends' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Appointment Trend */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center">
                                            <Activity className="w-5 h-5" /> Appointment Trend (Last 6 Months)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={data.appointmentTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="month" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Dentist Workload */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center">
                                            <Users className="w-5 h-5" /> Dentist Workload (Last Month)
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.dentistWorkload}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="dentist_name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#82ca9d" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Appointment Status Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex gap-2 items-center">
                                        <Activity className="w-5 h-5" /> Appointment Status Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-72">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.statusDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    nameKey="name"
                                                    label={({ name, percent }: PieChartLabelType) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                                                >
                                                    {data.statusDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Tab Content - Services */}
                    {activeTab === 'services' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Service Category Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center">
                                            <Activity className="w-5 h-5" /> Service Categories
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={data.serviceCategoryDistribution}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={true}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        nameKey="name"
                                                        label={({ name, percent }: PieChartLabelType) => `${name || ''}: ${((percent || 0) * 100).toFixed(0)}%`}
                                                    >
                                                        {data.serviceCategoryDistribution.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Popular Services */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center">
                                            <Activity className="w-5 h-5" /> Most Popular Services
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.serviceCategoryDistribution}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="value" fill="#8884d8" name="Appointments" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Tab Content - Scheduling */}
                    {activeTab === 'scheduling' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Peak Hours */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center">
                                            <Clock className="w-5 h-5" /> Peak Appointment Hours
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.peakHours}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="value" fill="#00C49F" name="Appointments" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Weekly Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex gap-2 items-center">
                                            <CalendarDays className="w-5 h-5" /> Weekday Distribution
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={data.weekdayDistribution}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="name" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="value" fill="#FFBB28" name="Appointments" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
