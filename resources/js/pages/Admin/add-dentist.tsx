import * as React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { PageProps } from '@inertiajs/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Dentists',
        href: '/admin/dentists',
    },
    {
        title: 'Add Dentist',
        href: '/admin/dentists/create',
    },
];

export default function AddDentist({ auth }: PageProps) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        contact_number: '',
        address: '',
        bio: '',
        years_of_experience: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.dentists.store'), {
            onSuccess: () => {
                toast({
                    title: 'Success',
                    description: 'Dentist created successfully',
                });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Add Dentist" />

            <div className="flex flex-col flex-1 gap-4 p-8 h-full">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Add New Dentist</h2>
                        <p className="text-muted-foreground">
                            Create a new dentist account for your clinic.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dentist Information</CardTitle>
                            <CardDescription>
                                Enter the dentist's personal and professional details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Dr. John Doe"
                                        required
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        placeholder="doctor@example.com"
                                        required
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        required
                                    />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 pt-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contact_number">Contact Number</Label>
                                    <Input
                                        id="contact_number"
                                        value={data.contact_number}
                                        onChange={e => setData('contact_number', e.target.value)}
                                        placeholder="+63 XXX XXX XXXX"
                                    />
                                    {errors.contact_number && <p className="text-sm text-destructive">{errors.contact_number}</p>}
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="years_of_experience">Years of Experience</Label>
                                    <Input
                                        id="years_of_experience"
                                        type="number"
                                        min="0"
                                        value={data.years_of_experience}
                                        onChange={e => setData('years_of_experience', e.target.value)}
                                        placeholder="5"
                                    />
                                    {errors.years_of_experience && <p className="text-sm text-destructive">{errors.years_of_experience}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={e => setData('address', e.target.value)}
                                    placeholder="Clinic address or home address"
                                    rows={2}
                                />
                                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Professional Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={e => setData('bio', e.target.value)}
                                    placeholder="Short professional biography and specializations"
                                    rows={4}
                                />
                                {errors.bio && <p className="text-sm text-destructive">{errors.bio}</p>}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Button variant="outline" type="button" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create Dentist'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
