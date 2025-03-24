import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PatientProfileForm {
    phone_number: string;
    date_of_birth: string;
    gender: string;
    address: string;
    medical_history: string;
    allergies: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    [key: string]: string;
}

interface PatientProfileData {
    id?: number;
    user_id?: number;
    phone_number?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    medical_history?: string;
    allergies?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    created_at?: string;
    updated_at?: string;
    balance?: number | null;
    suggested_next_appointment?: string | null;
    next_appointment_reason?: string | null;
}

export default function PatientProfileForm({ patientData, className = '' }: { patientData?: PatientProfileData, className?: string }) {
    const { data, setData, patch, errors, processing, reset } = useForm<PatientProfileForm>({
        phone_number: patientData?.phone_number || '',
        date_of_birth: patientData?.date_of_birth ? new Date(patientData.date_of_birth).toISOString().split('T')[0] : '',
        gender: patientData?.gender || '',
        address: patientData?.address || '',
        medical_history: patientData?.medical_history || '',
        allergies: patientData?.allergies || '',
        emergency_contact_name: patientData?.emergency_contact_name || '',
        emergency_contact_phone: patientData?.emergency_contact_phone || '',
    });

    useEffect(() => {
        if (patientData) {
            reset();
            setData({
                phone_number: patientData.phone_number || '',
                date_of_birth: patientData.date_of_birth ? new Date(patientData.date_of_birth).toISOString().split('T')[0] : '',
                gender: patientData.gender || '',
                address: patientData.address || '',
                medical_history: patientData.medical_history || '',
                allergies: patientData.allergies || '',
                emergency_contact_name: patientData.emergency_contact_name || '',
                emergency_contact_phone: patientData.emergency_contact_phone || '',
            });
        }
    }, [patientData, reset, setData]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('patient-profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <div className={className}>
            <HeadingSmall
                title="Patient Profile"
                description="Update your medical information and emergency contacts"
            />

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                        id="phone_number"
                        type="text"
                        className="block mt-1 w-full"
                        value={data.phone_number}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('phone_number', e.target.value)}
                        placeholder="+63 XXX XXX XXXX"
                    />
                    <InputError message={errors.phone_number} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                        id="date_of_birth"
                        type="date"
                        className="block mt-1 w-full"
                        value={data.date_of_birth}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('date_of_birth', e.target.value)}
                    />
                    <InputError message={errors.date_of_birth} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                        value={data.gender}
                        onValueChange={(value) => setData('gender', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors.gender} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                        id="address"
                        className="block mt-1 w-full"
                        value={data.address}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('address', e.target.value)}
                        rows={3}
                    />
                    <InputError message={errors.address} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="medical_history">Medical History</Label>
                    <Textarea
                        id="medical_history"
                        className="block mt-1 w-full"
                        value={data.medical_history}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('medical_history', e.target.value)}
                        rows={4}
                        placeholder="Please list any previous medical conditions or treatments that might be relevant to your dental care"
                    />
                    <InputError message={errors.medical_history} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                        id="allergies"
                        className="block mt-1 w-full"
                        value={data.allergies}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('allergies', e.target.value)}
                        rows={2}
                        placeholder="Please list any allergies you have, especially to medications or materials"
                    />
                    <InputError message={errors.allergies} className="mt-2" />
                </div>

                <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium">Emergency Contact Information</h3>
                </div>

                <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                        id="emergency_contact_name"
                        type="text"
                        className="block mt-1 w-full"
                        value={data.emergency_contact_name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('emergency_contact_name', e.target.value)}
                    />
                    <InputError message={errors.emergency_contact_name} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                        id="emergency_contact_phone"
                        type="text"
                        className="block mt-1 w-full"
                        value={data.emergency_contact_phone}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('emergency_contact_phone', e.target.value)}
                        placeholder="+63 XXX XXX XXXX"
                    />
                    <InputError message={errors.emergency_contact_phone} className="mt-2" />
                </div>

                <div className="flex gap-4 items-center">
                    <Button disabled={processing}>Save</Button>
                </div>
            </form>
        </div>
    );
}
