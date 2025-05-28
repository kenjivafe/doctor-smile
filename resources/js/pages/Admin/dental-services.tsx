import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { type BreadcrumbItem } from '@/types';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  MoveHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    title: 'Dental Services',
    href: '/admin/dental-services',
  },
];

// Define interfaces for the page props
interface DentalService {
  id: number;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

interface DentalServicesPageProps {
  services?: DentalService[];
}

export default function DentalServices({ services = [] }: DentalServicesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof DentalService>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sort change
  const handleSort = (field: keyof DentalService) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter services based on search query
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort the filtered services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortField === 'price' || sortField === 'duration_minutes') {
      // Sort numeric fields
      const valueA = a[sortField] as number;
      const valueB = b[sortField] as number;
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    } else {
      // Sort string fields
      const valueA = String(a[sortField]).toLowerCase();
      const valueB = String(b[sortField]).toLowerCase();
      return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
  });

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dental Services Management" />
      <div className="container p-8 mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Dental Services Management</h1>
          <p className="text-muted-foreground">
            View and manage all dental services offered by the clinic
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <CardTitle>Dental Services</CardTitle>
                <CardDescription>
                  Manage services, prices, and availability
                </CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center space-x-1">
                        <span>Service Name</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('description')} className="cursor-pointer hover:bg-muted/50 hidden md:table-cell">
                      <div className="flex items-center space-x-1">
                        <span>Description</span>
                        {sortField === 'description' ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('duration_minutes')} className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center space-x-1">
                        <span>Duration</span>
                        {sortField === 'duration_minutes' ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('price')} className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center space-x-1">
                        <span>Price</span>
                        {sortField === 'price' ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSort('is_active')} className="cursor-pointer hover:bg-muted/50">
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {sortField === 'is_active' ? (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedServices.length > 0 ? (
                    sortedServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <MoveHorizontal className="w-4 h-4 text-primary" />
                            {service.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                          {service.description}
                        </TableCell>
                        <TableCell>{service.duration_minutes} min</TableCell>
                        <TableCell>
                          ₱{service.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? 'default' : 'outline'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => window.location.href = `/admin/dental-services/${service.id}/edit`}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit service
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => alert(`Delete ${service.name}`)}
                                className="text-destructive"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete service
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {searchQuery 
                          ? 'No services found matching your search criteria.' 
                          : 'No dental services found. Add some services to get started.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
