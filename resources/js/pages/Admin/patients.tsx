import { useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpDown, Phone, Mail, Plus, Edit, Wallet, Users, Calendar, Activity, FileText } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip, Legend } from 'recharts';
import { DataTable } from '@/components/data-table';
import type { ColumnDef } from '@tanstack/react-table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Patients',
        href: '/admin/patients',
    },
];

// Define interfaces for the page props
interface PatientData {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    gender?: string;
    age?: number;
    balance: number;
    balance_type: 'outstanding';
    is_zero_balance: boolean;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalSpent: number;
    status: 'active' | 'inactive' | 'overdue' | 'new';
    hasAppointments: boolean;
}

interface AppointmentData {
    id: number;
    patient_name: string;
    dentist_name: string;
    service_name: string;
    appointment_datetime: string;
    status: string;
    duration_minutes: number;
    cost: number;
}

interface PatientStatsData {
    name: string;
    completedAppointments: number;
    cancelledAppointments: number;
    totalSpent: number;
}

interface PatientsPageProps extends PageProps {
    patients?: PatientData[];
    patientStats?: PatientStatsData[];
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

// Define columns for the patients table
const columns: ColumnDef<PatientData>[] = [
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
        cell: ({ row }: { row: TableRow<PatientData> }) => {
            const patient = row.original;
            return (
                <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={undefined} alt={patient.name} />
                        <AvatarFallback>{patient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{patient.name}</div>
                        <div className="text-xs text-muted-foreground">
                            {patient.gender}, {patient.age} years
                        </div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'email',
        header: 'Contact',
        cell: ({ row }: { row: TableRow<PatientData> }) => {
            const patient = row.original;
            return (
                <div>
                    <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm">{patient.email}</span>
                    </div>
                    {patient.phone && (
                        <div className="flex items-center mt-1 space-x-1">
                            <Phone className="w-3 h-3" />
                            <span className="text-sm">{patient.phone}</span>
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'balance',
        header: ({ column }: { column: TableColumn }) => (
            <div className="flex items-center justify-end">
                <span>Balance</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                </Button>
            </div>
        ),
        cell: ({ row }: { row: TableRow<PatientData> }) => {
            const patient = row.original;
            const balanceClass = patient.is_zero_balance ? 'text-green-600' : 'text-destructive';
            return (
                <div className="text-right">
                    <div className={`text-sm font-medium ${balanceClass}`}>
                        ₱{patient.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs capitalize text-muted-foreground">
                        {patient.balance_type}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'totalSpent',
        header: ({ column }: { column: TableColumn }) => (
            <div className="flex items-center justify-end">
                <span>Total Spent</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    <ArrowUpDown className="ml-2 w-4 h-4" />
                </Button>
            </div>
        ),
        cell: ({ row }: { row: TableRow<PatientData> }) => {
            const patient = row.original;
            return (
                <div className="text-right">
                    <div className="text-sm font-medium">
                        ₱{patient.totalSpent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {patient.completedAppointments} appointments
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: { row: TableRow<PatientData> }) => {
            const patient = row.original;
            const variant = getStatusVariant(patient.status);
            return (
                <Badge variant={variant} className="capitalize">
                    {patient.status}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }: { row: TableRow<PatientData> }) => {
            const patient = row.original;
            return (
                <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/patients/${patient.id}`}>
                            <span className="sr-only">View details</span>
                            <FileText className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/patients/${patient.id}/edit`}>
                            <span className="sr-only">Edit patient</span>
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
    switch (status) {
        case 'active':
            return 'default';
        case 'inactive':
            return 'secondary';
        case 'overdue':
            return 'destructive';
        case 'new':
            return 'secondary'; // New patients get a green badge like active patients
        default:
            return 'outline';
    }
}

export default function Patients() {
    const { patients = [], patientStats = [] } = usePage<PatientsPageProps>().props;
    const [activeTab, setActiveTab] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate total balance across all patients
    const totalBalance = patients.reduce((sum, patient) => sum + patient.balance, 0);

    // Calculate average completion rate
    const avgCompletionRate = patients.length > 0
        ? Math.round(patients.reduce((total, patient) => {
            if (patient.totalAppointments > 0) {
                return total + ((patient.completedAppointments / patient.totalAppointments) * 100);
            }
            return total;
        }, 0) / patients.filter(p => p.totalAppointments > 0).length || 0)
        : 0;

    // Filter patients based on search query
    const filteredPatients = patients.filter(patient =>
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Ensure patientStats is an array and sort by total spent
    const sortedPatientStats = Array.isArray(patientStats)
        ? [...patientStats]
            .sort((a, b) => b.totalSpent - a.totalSpent)
        : [];

    // Custom formatter for money in charts
    const formatMoney = (value: number) => `₱${value.toLocaleString()}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Management" />

            <div className="flex flex-col flex-1 gap-4 p-8 h-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Patient Management</h2>
                        <p className="text-muted-foreground">
                            Manage your dental clinic patients and track their activity.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/patients/create">
                            <Plus className="mr-2 w-4 h-4" />
                            Add Patient
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                            <Users className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{patients.length}</div>
                            <p className="text-xs text-muted-foreground">
                                {patients.filter(p => p.hasAppointments).length} with active appointments
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {patients.reduce((sum, patient) => sum + patient.totalAppointments, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {patients.reduce((sum, patient) => sum + patient.completedAppointments, 0)} completed
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                            <Wallet className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ₱{Math.abs(totalBalance).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Outstanding balance
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                            <Activity className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgCompletionRate}%</div>
                            <p className="text-xs text-muted-foreground">
                                Average appointment completion
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full">
                    <div className="border-b">
                        <div className="flex space-x-6">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'list' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                            >
                                Patient List
                            </button>
                            <button
                                onClick={() => setActiveTab('spending')}
                                className={`px-4 py-2 text-sm font-medium ${activeTab === 'spending' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                            >
                                Spending Analysis
                            </button>
                        </div>
                    </div>

                    {/* Patient List Tab */}
                    {activeTab === 'list' && (
                        <div className="pt-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <CardTitle>Patients</CardTitle>
                                            <CardDescription>
                                                Manage your patients and their details.
                                            </CardDescription>
                                        </div>
                                        <div className="flex gap-2 w-64">
                                            <div className="relative w-full">
                                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search patients..."
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
                                    <div className="hidden">{JSON.stringify(filteredPatients)}</div>
                                    {Array.isArray(filteredPatients) && filteredPatients.length > 0 ? (
                                        <DataTable
                                            columns={columns}
                                            data={filteredPatients}
                                        />
                                    ) : (
                                        <div className="flex flex-col justify-center items-center py-10">
                                            <p className="text-muted-foreground">No patients found</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Spending Analysis Tab */}
                    {activeTab === 'spending' && (
                        <div className="grid gap-4 pt-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Patients by Spending</CardTitle>
                                    <CardDescription>
                                        Showing the patients who have spent the most on dental services
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sortedPatientStats} layout="vertical">
                                                <XAxis type="number" tickFormatter={formatMoney} />
                                                <YAxis type="category" dataKey="name" hide={true} />
                                                <Tooltip formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Total Spent']} />
                                                <Legend />
                                                <Bar
                                                    dataKey="totalSpent"
                                                    name="Total Spent"
                                                    fill="#4f46e5"
                                                    radius={[0, 4, 4, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Appointment Completion</CardTitle>
                                    <CardDescription>
                                        Comparison of completed vs cancelled appointments
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={sortedPatientStats}>
                                                <XAxis dataKey="name" hide={true} />
                                                <YAxis tickLine={false} />
                                                <Tooltip />
                                                <Legend />
                                                <Bar
                                                    dataKey="completedAppointments"
                                                    name="Completed"
                                                    fill="#22c55e"
                                                    stackId="a"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                                <Bar
                                                    dataKey="cancelledAppointments"
                                                    name="Cancelled"
                                                    fill="#ef4444"
                                                    stackId="a"
                                                    radius={[4, 4, 0, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
