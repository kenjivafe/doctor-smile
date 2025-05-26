import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Phone, Mail, User, Clock, DollarSign, FileText } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';

interface PatientDetails {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  medical_history: string | null;
  allergies: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  balance: number;
  suggested_next_appointment: string | null;
  next_appointment_reason: string | null;
}

interface Appointment {
  id: number;
  service_name: string;
  appointment_datetime: string;
  status: string;
  duration_minutes: number;
  cost: number;
  notes: string | null;
  treatment_notes: string | null;
}

interface PatientDetailsProps {
  patient: PatientDetails;
  appointments: Appointment[];
}

export default function PatientDetails({ patient, appointments = [] }: PatientDetailsProps) {
  console.log('Patient data:', patient);
  console.log('Appointments:', appointments);

  // Make sure the overview tab is selected by default
  const [activeTab, setActiveTab] = useState('overview');
  // State for balance update popover
  const [showBalancePopover, setShowBalancePopover] = useState(false);
  console.log('Active tab:', activeTab);

  // Check if patient data exists and log more details
  const hasPatientData = patient && typeof patient === 'object';
  console.log('Has patient data:', hasPatientData);
  console.log('Patient object keys:', patient ? Object.keys(patient) : 'No patient object');

  // Safe values for patient data
  const patientName = hasPatientData && patient?.name ? patient.name : 'Unknown Patient';
  const patientId = hasPatientData && patient?.id ? patient.id : 0;
  const patientEmail = hasPatientData && patient?.email ? patient.email : 'No Email';
  const patientPhone = hasPatientData && patient?.phone_number ? patient.phone_number : 'Not provided';

  // Capitalize gender for display
  const formatGender = (gender: string | null | undefined): string => {
    if (!gender) return 'Not specified';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const patientGender = hasPatientData && patient?.gender ? formatGender(patient.gender) : 'Not specified';
  const patientDob = hasPatientData && patient?.date_of_birth ? patient.date_of_birth : null;
  const patientAddress = hasPatientData && patient?.address ? patient.address : 'Not specified';
  const patientMedicalHistory = hasPatientData && patient?.medical_history ? patient.medical_history : 'None';
  const patientAllergies = hasPatientData && patient?.allergies ? patient.allergies : 'None';
  const patientEmergencyName = hasPatientData && patient?.emergency_contact_name ? patient.emergency_contact_name : 'Not specified';
  const patientEmergencyPhone = hasPatientData && patient?.emergency_contact_phone ? patient.emergency_contact_phone : 'Not specified';
  const patientBalance = hasPatientData && patient?.balance ? patient.balance : 0;
  const patientNextAppointment = hasPatientData && patient?.suggested_next_appointment ? patient.suggested_next_appointment : '';
  const patientNextAppointmentReason = hasPatientData && patient?.next_appointment_reason ? patient.next_appointment_reason : '';

  // Ensure appointments is always an array
  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Patients',
      href: '/dentist/patients',
    },
    {
      title: patientName,
      href: `/dentist/patients/${patientId}`,
    },
  ];

  // Form for updating next appointment suggestion
  const nextAppointmentForm = useForm({
    suggested_next_appointment: patientNextAppointment,
    next_appointment_reason: patientNextAppointmentReason,
  });

  // Form for updating medical notes
  const medicalNotesForm = useForm({
    medical_history: patientMedicalHistory,
    allergies: patientAllergies,
  });

  // Form for updating balance
  const balanceForm = useForm({
    balance: patientBalance,
  });

  // Handle next appointment form submission
  const handleNextAppointmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    nextAppointmentForm.post(`/dentist/patients/${patient.id}/update-next-appointment`);
  };

  // Handle medical notes form submission
  const handleMedicalNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    medicalNotesForm.post(`/dentist/patients/${patientId}/update-medical-notes`);
  };

  // Handle balance form submission
  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    balanceForm.post(`/dentist/patients/${patientId}/update-balance`);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return format(new Date(dateString), 'MMMM d, yyyy');
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString: string) => {
    return format(new Date(dateTimeString), 'MMM d, yyyy h:mm a');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
      case 'confirmed':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-destructive';
      case 'no-show':
        return 'text-amber-600';
      default:
        return 'text-muted-foreground';
    }
  };

  // Add more detailed debugging
  console.log('Patient name:', patientName);
  console.log('Patient email:', patientEmail);
  console.log('Patient phone:', patientPhone);
  console.log('Patient gender:', patientGender);
  console.log('Patient DOB:', patientDob);
  console.log('Patient address:', patientAddress);
  console.log('Patient medical history:', patientMedicalHistory);
  console.log('Patient allergies:', patientAllergies);
  console.log('Patient emergency name:', patientEmergencyName);
  console.log('Patient emergency phone:', patientEmergencyPhone);
  console.log('Patient balance:', patientBalance);

  // Render a fallback UI if patient data is completely missing
  if (!hasPatientData) {
    return (
      <PageTemplate title="" breadcrumbs={breadcrumbs}>
        <div className="mt-[-2rem] flex flex-col justify-center items-center p-6 h-64 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Patient Data Unavailable</h2>
          <p className="mb-6 text-gray-600">The patient data could not be loaded or is incomplete.</p>
          <Link href="/dentist/patients" className="px-4 py-2 text-white rounded transition-colors bg-primary hover:bg-primary/90">
            Return to Patients List
          </Link>
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title="Patient Details" breadcrumbs={breadcrumbs}>
      <div className="space-y-6 mt-[-2rem]">
        {/* Patient Overview Card */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 justify-between items-start mb-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">{patientName}</h2>
              <div className="flex flex-col gap-2 mt-2 sm:flex-row sm:items-center sm:gap-4 text-muted-foreground">
                {patientEmail && (
                  <div className="flex items-center">
                    <Mail className="mr-2 w-4 h-4" />
                    <span>{patientEmail}</span>
                  </div>
                )}
                {patientPhone && (
                  <div className="flex items-center">
                    <Phone className="mr-2 w-4 h-4" />
                    <span>{patientPhone}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Link href={`/dentist/appointments?patient_id=${patientId}`}>
                <Button variant="outline">View Appointments</Button>
              </Link>
            </div>
          </div>

          <div className="w-full">
            <div className="flex mb-4 border-b">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 ${activeTab === 'overview' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-4 py-2 ${activeTab === 'appointments' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
              >
                Appointments
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`px-4 py-2 ${activeTab === 'medical' ? 'border-b-2 border-primary font-medium' : 'text-gray-500'}`}
              >
                Medical Notes
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Personal Information</h3>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <User className="mt-1 mr-2 w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Gender:</span>{' '}
                        <span>{patientGender}</span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Calendar className="mt-1 mr-2 w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Date of Birth:</span>{' '}
                        <span>{formatDate(patientDob)}</span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <FileText className="mt-1 mr-2 w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Address:</span>{' '}
                        <span>{patientAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Emergency Contact</h3>

                  <div className="space-y-2">
                    <div className="flex items-start">
                      <User className="mt-1 mr-2 w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Name:</span>{' '}
                        <span>{patientEmergencyName}</span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="mt-1 mr-2 w-4 h-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">Phone:</span>{' '}
                        <span>{patientEmergencyPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-base font-semibold">Account Information</h3>

                <div className="space-y-2">
                  <div className="flex items-start">
                    <DollarSign className="mt-1 mr-2 w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Balance:</span>{' '}
                      <div className="flex gap-2 items-center">
                        <span className={Number(patientBalance) > 0 ? 'text-destructive font-medium' : 'text-green-600 font-medium'}>
                          ₱{typeof patientBalance === 'number'
                            ? patientBalance.toFixed(2)
                            : Number(patientBalance).toFixed(2)}
                        </span>
                        <div className="inline-block relative">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="px-2 py-0 h-6 text-xs"
                            onClick={() => setShowBalancePopover(!showBalancePopover)}
                          >
                            Update
                          </Button>

                          {showBalancePopover && (
                            <div className="absolute -left-12 z-10 p-3 mt-1 w-64 bg-white rounded-md border shadow-lg">
                              <form onSubmit={(e) => {
                                handleBalanceSubmit(e);
                                setShowBalancePopover(false);
                              }}>
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">New Balance</label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2">₱</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="py-1 pr-2 pl-6 w-full text-sm rounded border"
                                      value={balanceForm.data.balance}
                                      onChange={e => balanceForm.setData('balance', parseFloat(e.target.value))}
                                      autoFocus
                                    />
                                  </div>
                                  {balanceForm.errors.balance && (
                                    <p className="text-xs text-destructive">{balanceForm.errors.balance}</p>
                                  )}
                                  <div className="flex gap-2 justify-end mt-2">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => setShowBalancePopover(false)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      type="submit"
                                      size="sm"
                                      className="h-7 text-xs"
                                      disabled={balanceForm.processing}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="mt-1 mr-2 w-4 h-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Total Appointments:</span>{' '}
                      <span>{safeAppointments.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <h3 className="text-base font-semibold">Next Appointment Suggestion</h3>

                <form onSubmit={handleNextAppointmentSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="suggested_next_appointment" className="block mb-1 text-sm font-medium">
                        Suggested Date
                      </label>
                      <input
                        type="date"
                        id="suggested_next_appointment"
                        className="px-3 py-2 w-full rounded-md border border-input bg-background"
                        value={nextAppointmentForm.data.suggested_next_appointment}
                        onChange={e => nextAppointmentForm.setData('suggested_next_appointment', e.target.value)}
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                      {nextAppointmentForm.errors.suggested_next_appointment && (
                        <p className="mt-1 text-sm text-destructive">{nextAppointmentForm.errors.suggested_next_appointment}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="next_appointment_reason" className="block mb-1 text-sm font-medium">
                        Reason
                      </label>
                      <Textarea
                        id="next_appointment_reason"
                        className="px-3 py-2 w-full h-20 rounded-md border border-input bg-background"
                        value={nextAppointmentForm.data.next_appointment_reason}
                        onChange={e => nextAppointmentForm.setData('next_appointment_reason', e.target.value)}
                      />
                      {nextAppointmentForm.errors.next_appointment_reason && (
                        <p className="mt-1 text-sm text-destructive">{nextAppointmentForm.errors.next_appointment_reason}</p>
                      )}
                    </div>

                    <Button type="submit" disabled={nextAppointmentForm.processing}>
                      Update Next Appointment
                    </Button>
                  </div>
                </form>
              </div>
              </div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <div className="mt-6">
              <div className="rounded-md border">
                {safeAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="font-medium">{formatDateTime(appointment.appointment_datetime)}</div>
                          </TableCell>
                          <TableCell>{appointment.service_name}</TableCell>
                          <TableCell>
                            <span className={getStatusColor(appointment.status)}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{appointment.duration_minutes} min</TableCell>
                          <TableCell>
                            ₱{typeof appointment.cost === 'number'
                              ? appointment.cost.toFixed(2)
                              : Number(appointment.cost).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dentist/appointments/${appointment.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No appointment history found for this patient.</p>
                    <Button className="mt-4" asChild>
                      <Link href="/dentist/appointments/create">Schedule an appointment</Link>
                    </Button>
                  </div>
                )}
              </div>
              </div>
            )}

            {/* Medical Notes Tab */}
            {activeTab === 'medical' && (
              <div className="mt-6">
              <form onSubmit={handleMedicalNotesSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="medical_history" className="block mb-1 text-sm font-medium">
                      Medical History
                    </label>
                    <Textarea
                      id="medical_history"
                      className="px-3 py-2 w-full h-40 rounded-md border border-input bg-background"
                      value={medicalNotesForm.data.medical_history}
                      onChange={e => medicalNotesForm.setData('medical_history', e.target.value)}
                      placeholder="Enter patient's medical history..."
                    />
                    {medicalNotesForm.errors.medical_history && (
                      <p className="mt-1 text-sm text-destructive">{medicalNotesForm.errors.medical_history}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="allergies" className="block mb-1 text-sm font-medium">
                      Allergies
                    </label>
                    <Textarea
                      id="allergies"
                      className="px-3 py-2 w-full h-20 rounded-md border border-input bg-background"
                      value={medicalNotesForm.data.allergies}
                      onChange={e => medicalNotesForm.setData('allergies', e.target.value)}
                      placeholder="Enter patient's allergies..."
                    />
                    {medicalNotesForm.errors.allergies && (
                      <p className="mt-1 text-sm text-destructive">{medicalNotesForm.errors.allergies}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={medicalNotesForm.processing}>
                    Update Medical Notes
                  </Button>
                </div>
              </form>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageTemplate>
  );
}
