import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Patients',
        href: '/admin/patients',
    },
    {
        title: 'Add Patient',
        href: '/admin/patients/create',
    }
];

export default function CreatePatient() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone_number: '',
        address: '',
        gender: '',
        date_of_birth: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/patients');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add New Patient" />

            <div className="flex flex-col flex-1 gap-4 p-8 h-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Add New Patient</h2>
                        <p className="text-muted-foreground">
                            Create a new patient record in the system.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/admin/patients">
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Back to Patients
                        </Link>
                    </Button>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Patient Information</CardTitle>
                        <CardDescription>
                            Enter the new patient's details. All fields marked with * are required.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Enter full name"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email Address <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        placeholder="Enter password"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm Password <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone_number">
                                        Phone Number <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        value={data.phone_number}
                                        onChange={e => setData('phone_number', e.target.value)}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone_number && (
                                        <p className="text-sm text-destructive">{errors.phone_number}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">
                                        Gender <span className="text-destructive">*</span>
                                    </Label>
                                    <Select 
                                        value={data.gender} 
                                        onValueChange={(value) => setData('gender', value)}
                                    >
                                        <SelectTrigger id="gender">
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-sm text-destructive">{errors.gender}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">
                                        Date of Birth <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={e => setData('date_of_birth', e.target.value)}
                                        placeholder="Select date of birth"
                                    />
                                    {errors.date_of_birth && (
                                        <p className="text-sm text-destructive">{errors.date_of_birth}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">
                                    Address <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Enter address"
                                />
                                {errors.address && (
                                    <p className="text-sm text-destructive">{errors.address}</p>
                                )}
                            </div>

                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive">
                                    <AlertCircle className="w-4 h-4" />
                                    <AlertDescription>
                                        Please fix the errors above before submitting the form.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-end gap-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    asChild
                                >
                                    <Link href="/admin/patients">
                                        Cancel
                                    </Link>
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                >
                                    {processing ? 'Creating...' : 'Create Patient'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
