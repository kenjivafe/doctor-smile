import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, Clock, PhilippinePeso, Calendar } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
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

// Define chart data types
interface StatusChartData {
    name: string;
    value: number;
    color: string;
    rawStatus: string;
}

// Define a type for Recharts PieChart active shape props with optional fields
interface RechartsActiveShapeProps {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
    fill?: string;
    payload?: StatusChartData;
    percent?: number;
    value?: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: StatusChartData;
    }>;
}

interface LegendPayload {
    value: string;
}

export default function AdminDashboard() {
    // State for active pie segment
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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

    // Helper function to format status names nicely
    const formatStatusName = (status: string): string => {
        return status
            .charAt(0).toUpperCase() +
            status.slice(1)
                .replace(/-/g, ' ')  // Replace hyphens with spaces
                .replace(/_/g, ' '); // Replace underscores with spaces
    };

    // Format status distribution data for the pie chart
    // Create the data in a specific order: Completed, Confirmed, Scheduled, No Show, Canceled
    const statusOrder = ['completed', 'confirmed', 'scheduled', 'no-show', 'no_show', 'cancelled'];
    const statusChartData: StatusChartData[] = statusOrder
        .filter(status => status in safeStatusDistribution)
        .map(status => ({
            name: formatStatusName(status),
            value: safeStatusDistribution[status] || 0,
            color: getStatusColorForChart(status),
            rawStatus: status
        }));

    // Add any remaining statuses that might not be in our predefined order
    Object.entries(safeStatusDistribution)
        .filter(([status]) => !statusOrder.includes(status))
        .forEach(([status, count]) => {
            statusChartData.push({
                name: formatStatusName(status),
                value: count,
                color: getStatusColorForChart(status),
                rawStatus: status
            });
        });

    // Handle pie segment click
    const handlePieClick = (_data: unknown, index: number) => {
        setActiveIndex(index === activeIndex ? undefined : index);
        // Future enhancement: Could filter the appointments list by this status
    };

    // Handle mouse enter
    const handlePieEnter = (_: unknown, index: number) => {
        setActiveIndex(index);
    };

    // Handle mouse leave
    const handlePieLeave = () => {
        setActiveIndex(undefined);
    };

    // Custom active shape to render when a segment is active
    const renderActiveShape = (props: RechartsActiveShapeProps) => {
        const cx = props.cx ?? 0;
        const cy = props.cy ?? 0;
        const innerRadius = props.innerRadius ?? 0;
        const outerRadius = props.outerRadius ?? 0;
        const startAngle = props.startAngle ?? 0;
        const endAngle = props.endAngle ?? 0;
        const fill = props.fill ?? '#8884d8';
        const payload = props.payload;
        const percent = props.percent ?? 0;
        const value = props.value ?? 0;

        const name = payload?.name || '';

        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 10}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                    cornerRadius={4}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 14}
                    outerRadius={outerRadius + 18}
                    fill={fill}
                    cornerRadius={2}
                />
                <text x={cx} y={cy - 16} dy={8} textAnchor="middle" fill={fill} className="text-lg font-medium">
                    {name}
                </text>
                <text x={cx} y={cy + 16} textAnchor="middle" fill="#666" className="text-base">
                    {`${value} (${(percent * 100).toFixed(0)}%)`}
                </text>
            </g>
        );
    };

    // Custom tooltip for hover
    const CustomTooltip = ({ active, payload }: TooltipProps) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="p-3 bg-white rounded-lg border border-gray-100 shadow-lg">
                    <p className="text-sm font-bold" style={{ color: data.color }}>
                        {data.name}
                    </p>
                    <p className="text-xs text-gray-600">Count: <span className="font-medium">{data.value}</span></p>
                    <p className="text-xs text-gray-600">Percentage: <span className="font-medium">{((data.value / safeStats.totalAppointments) * 100).toFixed(1)}%</span></p>
                </div>
            );
        }
        return null;
    };

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
                            <PhilippinePeso className="w-4 h-4 text-muted-foreground" />
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
                                Current appointment distribution. Click on segments for details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        dataKey="value"
                                        onClick={handlePieClick}
                                        onMouseEnter={handlePieEnter}
                                        onMouseLeave={handlePieLeave}
                                        isAnimationActive={true}
                                        animationBegin={0}
                                        animationDuration={800}
                                        animationEasing="ease-out"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        wrapperStyle={{
                                            paddingTop: '20px',
                                        }}
                                        onClick={(data: LegendPayload) => {
                                            const index = statusChartData.findIndex(item => item.name === data.value);
                                            handlePieClick(null, index);
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
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

// Helper function to get status color for chart
function getStatusColorForChart(status: string): string {
    switch (status.toLowerCase()) {
        case 'scheduled':
            return '#3b82f6'; // blue-500
        case 'confirmed':
            return '#10b981'; // emerald-500
        case 'completed':
            return '#f59e0b'; // amber-500
        case 'cancelled':
            return '#ef4444'; // red-500
        case 'no-show':
        case 'no_show':
            return '#6b7280'; // gray-500
        case 'rescheduled':
            return '#6366f1'; // indigo-500
        case 'pending':
            return '#9ca3af'; // gray-400
        default:
            return '#d1d5db'; // gray-300
    }
}

// Helper function to get status text class
function getStatusTextClass(status: string): string {
    switch (status.toLowerCase()) {
        case 'scheduled':
            return 'text-blue-500';
        case 'confirmed':
            return 'text-emerald-500';
        case 'completed':
            return 'text-violet-500';
        case 'cancelled':
            return 'text-red-500';
        case 'no-show':
            return 'text-amber-500';
        case 'rescheduled':
            return 'text-indigo-500';
        case 'pending':
            return 'text-gray-400';
        default:
            return 'text-gray-500';
    }
}
