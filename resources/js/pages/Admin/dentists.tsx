import { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, FileText, BarChart3, Search, UserRound, ArrowUpDown, Phone, Mail, Plus, Edit } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip, Legend } from 'recharts';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Dentists',
        href: '/admin/dentists',
    },
];

// Define interfaces for the page props
interface DentistData {
    id: number;
    name: string;
    email: string;
    phone?: string; // direct from join (dentists.phone)
    dentist?: {
        phone?: string;
        specialty?: string;
        avatar?: string;
    };
    specialty?: string;
    avatar?: string;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    revenue: number;
    rating: number;
    status: 'active' | 'inactive' | 'onleave';
}

interface AppointmentData {
    id: number;
    patient_name: string;
    service_name: string;
    appointment_datetime: string;
    status: string;
    duration_minutes: number;
    cost: number;
}

interface DentistStatsData {
    name: string;
    completedAppointments: number;
    cancelledAppointments: number;
    revenue: number;
}

interface DentistsPageProps extends PageProps {
    dentists?: DentistData[];
    dentistStats?: DentistStatsData[];
    recentAppointments?: AppointmentData[];
}

// Define types for table components
type SortingState = 'asc' | 'desc' | false;

interface TableColumn {
    toggleSorting: (state: boolean) => void;
    getIsSorted: () => SortingState;
}

interface TableRow<T> {
    original: T;
    getValue: (key: string) => unknown;
}

// Define columns for the dentists table
const columns: ColumnDef<DentistData>[] = [
    {
        accessorKey: 'name',
        header: ({ column }: { column: TableColumn }) => (
            <div className="flex items-center">
                <span>Name</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                </Button>
            </div>
        ),
        cell: ({ row }: { row: TableRow<DentistData> }) => {
            const dentist = row.original;
            return (
                <div className="flex gap-3 items-center">
                    <Avatar>
                        <AvatarImage src={dentist.avatar} alt={dentist.name} />
                        <AvatarFallback>
                            <UserRound className="w-5 h-5" />
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium">{dentist.name}</p>
                        <p className="text-sm text-muted-foreground">General Dentistry</p>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        header: 'Contact',
        cell: ({ row }: { row: TableRow<DentistData> }) => {
            const dentist = row.original;
            return (
                <div className="space-y-1">
                    <div className="flex items-center text-sm">
                        <Mail className="mr-2 w-3.5 h-3.5 text-muted-foreground" />
                        <span>{dentist.email}</span>
                    </div>
                    {dentist.phone && (
                        <div className="flex items-center text-sm">
                            <Phone className="mr-2 w-3.5 h-3.5 text-muted-foreground" />
                            <span>{dentist.phone}</span>
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'totalAppointments',
        header: () => <div className="text-right">Appointments</div>,
        cell: ({ row }: { row: TableRow<DentistData> }) => {
            const totalAppointments = row.getValue('totalAppointments') as number;
            const completed = row.original.completedAppointments;
            const completionRate = totalAppointments > 0
                ? Math.round((completed / totalAppointments) * 100)
                : 0;

            return (
                <div className="space-y-1 text-right">
                    <p className="font-medium">{totalAppointments}</p>
                    <p className="text-xs text-muted-foreground">{completionRate}% completed</p>
                </div>
            );
        },
    },
    {
        accessorKey: 'revenue',
        header: () => <div className="text-right">Revenue</div>,
        cell: ({ row }: { row: TableRow<DentistData> }) => {
            const revenueValue = row.getValue('revenue');
            const revenue = typeof revenueValue === 'number'
                ? revenueValue
                : parseFloat(String(revenueValue) || '0');

            const formatted = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(revenue);

            return <div className="font-medium text-right">{formatted}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: { row: TableRow<DentistData> }) => {
            const statusValue = row.getValue('status');
            const status = typeof statusValue === 'string' ? statusValue : 'unknown';
            return (
                <div className="flex justify-center">
                    <Badge variant={getStatusVariant(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </div>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }: { row: TableRow<DentistData> }) => {
            const dentist = row.original;
            return (
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="icon">
                        <Link href={`/admin/dentists/${dentist.id}`}>
                            <FileText className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Link href={`/admin/dentists/${dentist.id}/edit`}>
                            <Edit className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            );
        },
    },
];

// Helper function to get status badge variant
function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    switch (status.toLowerCase()) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        case 'onleave':
            return 'outline';
        default:
            return 'outline';
    }
}

export default function Dentists() {
    // Get data from props
    const { dentists = [], dentistStats = [], recentAppointments = [] } = usePage<DentistsPageProps>().props;

    // State for search input and active tab
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('list');

    // Handle tab changes
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Calculate total metrics to ensure they're accurate
    const totalCompletedAppointments = dentists.reduce(
        (total, dentist) => total + (dentist.completedAppointments || 0), 0
    );

    const totalRevenue = dentists.reduce(
        (total, dentist) => total + (dentist.revenue || 0), 0
    );

    // Calculate average completion rate properly
    const avgCompletionRate = dentists.length > 0
        ? Math.round(dentists.reduce((total, dentist) => {
            if (dentist.totalAppointments > 0) {
                return total + ((dentist.completedAppointments / dentist.totalAppointments) * 100);
            }
            return total;
        }, 0) / dentists.filter(d => d.totalAppointments > 0).length || 0)
        : 0;

    // Filter dentists based on search query
    const filteredDentists = dentists.filter(dentist =>
        dentist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dentist.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort dentist stats by revenue for the chart
    const sortedDentistStats = [...dentistStats]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Show top 10 dentists

    // Custom formatter for revenue in charts
    const formatRevenue = (value: number) => `₱${value.toLocaleString()}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dentist Management" />

            <div className="flex flex-col flex-1 gap-4 p-8 h-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Dentist Management</h2>
                        <p className="text-muted-foreground">
                            Manage your dental clinic professionals and track their performance.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.dentists.create')}>
                            <Plus className="mr-2 w-4 h-4" />
                            Add Dentist
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Dentists</CardTitle>
                            <UserRound className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{dentists.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {dentists.filter(d => d.status === 'active').length} active
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totalCompletedAppointments}
                            </div>
                            <p className="text-xs text-muted-foreground">Across all dentists</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱{totalRevenue.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">From completed treatments</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {avgCompletionRate}%
                            </div>
                            <p className="text-xs text-muted-foreground">Appointment completion</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full">
                    <div className="border-b">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'list' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                            >
                                Dentist List
                            </button>
                            <button
                                onClick={() => setActiveTab('performance')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'performance' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                            >
                                Performance
                            </button>
                        </div>
                    </div>

                    {/* Dentist List Tab */}
                    {activeTab === 'list' && (
                        <div className="pt-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Dentists</CardTitle>
                                            <CardDescription>
                                                Manage your dentists and their details.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2 w-64">
                                            <div className="relative w-full">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search dentists..."
                                                    className="pl-8"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Debug data in a way that doesn't cause TypeScript errors */}
                                    <div className="hidden">{JSON.stringify(filteredDentists)}</div>
                                    {Array.isArray(filteredDentists) && filteredDentists.length > 0 ? (
                                        <DataTable
                                            columns={columns}
                                            data={filteredDentists.map(dentist => ({
                                                id: dentist.id,
                                                name: dentist.name || 'Unknown',
                                                email: dentist.email || 'No email',
                                                phone: dentist.phone || 'No phone',
                                                specialty: 'General Dentistry', // Default value as this field doesn't exist in DB
                                                totalAppointments: dentist.totalAppointments || 0,
                                                completedAppointments: dentist.completedAppointments || 0,
                                                cancelledAppointments: dentist.cancelledAppointments || 0,
                                                revenue: dentist.revenue || 0,
                                                rating: dentist.rating || 0,
                                                status: dentist.status || 'active',
                                            }))}
                                        />
                                    ) : (
                                        <div className="flex justify-center items-center py-16 text-muted-foreground">
                                            {searchQuery ? 'No dentists match your search' : 'No dentists found'}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Performance Tab */}
                    {activeTab === 'performance' && (
                        <div className="pt-4">
                            <div className="grid gap-4 md:grid-cols-2">
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>Revenue by Dentist</CardTitle>
                                    <CardDescription>
                                        Top performing dentists by revenue generated
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={sortedDentistStats}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    tickMargin={20}
                                                />
                                                <YAxis />
                                                <Tooltip formatter={formatRevenue} />
                                                <Legend />
                                                <Bar
                                                    dataKey="revenue"
                                                    fill="#4f46e5"
                                                    name="Revenue (₱)"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Completed Appointments</CardTitle>
                                    <CardDescription>
                                        Number of successfully completed appointments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={sortedDentistStats}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    tickMargin={20}
                                                />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="completedAppointments"
                                                    fill="#22c55e"
                                                    name="Completed"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Cancelled Appointments</CardTitle>
                                    <CardDescription>
                                        Number of cancelled appointments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={sortedDentistStats}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                            >
                                                <XAxis
                                                    dataKey="name"
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={60}
                                                    tickMargin={20}
                                                />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="cancelledAppointments"
                                                    fill="#ef4444"
                                                    name="Cancelled"
                                                    radius={[4, 4, 0, 0]}
                                                />
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
