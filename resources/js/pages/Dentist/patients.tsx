import { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Calendar, Phone, User, Clock, DollarSign, ArrowUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  last_visit: string | null;
  appointment_count: number;
  balance: number;
  suggested_next_appointment: string | null;
  next_appointment_reason: string | null;
}

interface PatientsProps {
  patients: Patient[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Patients',
    href: '/dentist/patients',
  },
];

export default function Patients({ patients = [] }: PatientsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Patient>('last_visit');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sorting
  const handleSort = (field: keyof Patient) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
      (patient.phone_number && patient.phone_number.includes(searchTerm))
    );
  });

  // Sort patients based on sort field and direction
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle null values
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortDirection === 'asc' ? 1 : -1;
    if (bValue === null) return sortDirection === 'asc' ? -1 : 1;

    // Sort based on field type
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Default case
    return 0;
  });

  return (
    <PageTemplate title="My Patients" breadcrumbs={breadcrumbs}>
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {sortedPatients.length} of {patients.length} patients
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort('name')}>
                    <User className="mr-2 h-4 w-4" />
                    Patient Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort('phone_number')}>
                    <Phone className="mr-2 h-4 w-4" />
                    Contact
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort('last_visit')}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Last Visit
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort('appointment_count')}>
                    <Clock className="mr-2 h-4 w-4" />
                    Visits
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => handleSort('balance')}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Balance
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPatients.length > 0 ? (
                sortedPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      <div>{patient.name}</div>
                      <div className="text-sm text-muted-foreground">{patient.email}</div>
                    </TableCell>
                    <TableCell>
                      {patient.phone_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {patient.last_visit ? (
                        <span className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {patient.last_visit}
                        </span>
                      ) : (
                        'Never'
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.appointment_count}
                    </TableCell>
                    <TableCell>
                      <span className={`${Number(patient.balance) > 0 ? 'text-destructive' : 'text-green-600'}`}>
                        ₱{typeof patient.balance === 'number' 
                          ? patient.balance.toFixed(2) 
                          : Number(patient.balance).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dentist/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchTerm ? (
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg font-medium">No patients found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg font-medium">No patients yet</p>
                        <p className="text-sm text-muted-foreground">You haven't treated any patients yet</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageTemplate>
  );
}
