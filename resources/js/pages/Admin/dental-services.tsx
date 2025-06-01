import { useState } from 'react';
import { router } from '@inertiajs/react';
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
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  MoveHorizontal,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  price: number;
  is_active: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface DentalServicesPageProps {
  services?: DentalService[];
}

export default function DentalServices({ services = [] }: DentalServicesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof DentalService>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<DentalService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const openToggleDialog = (service: DentalService) => {
    setSelectedService(service);
    setToggleDialogOpen(true);
  };
  
  const openDeleteDialog = (service: DentalService) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };
  
  const handleToggleStatus = () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    
    // Create a form data object
    const formData = new FormData();
    formData.append('_method', 'PATCH');
    
    // Use post with _method instead of patch directly
    router.post(`/admin/dental-services/${selectedService.id}/toggle-status`, formData, {
      forceFormData: true,
      onSuccess: () => {
        setToggleDialogOpen(false);
        setSelectedService(null);
        // Refresh the page to reset any stuck state
        window.location.reload();
      },
      onError: () => {
        setIsLoading(false);
      }
    });
  };
  
  const handleDeleteService = () => {
    if (!selectedService) return;
    
    setIsLoading(true);
    
    // Create a form data object
    const formData = new FormData();
    formData.append('_method', 'DELETE');
    
    // Use post with _method instead of delete directly
    router.post(`/admin/dental-services/${selectedService.id}`, formData, {
      forceFormData: true,
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedService(null);
        // Refresh the page to reset any stuck state
        window.location.reload();
      },
      onError: () => {
        setIsLoading(false);
      }
    });
  };

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
    if (sortField === 'price') {
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
            <div className="flex flex-col gap-4 justify-between md:flex-row">
              <div>
                <CardTitle>Dental Services</CardTitle>
                <CardDescription>
                  Manage services, prices, and availability
                </CardDescription>
              </div>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button
                  className="whitespace-nowrap"
                  onClick={() => window.location.href = '/admin/dental-services/create'}
                >
                  <Plus className="mr-2 w-4 h-4" />
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
                    <TableHead onClick={() => handleSort('description')} className="hidden cursor-pointer hover:bg-muted/50 md:table-cell">
                      <div className="flex items-center space-x-1">
                        <span>Description</span>
                        {sortField === 'description' ? (
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
                          <div className="flex gap-2 items-center">
                            <MoveHorizontal className="w-4 h-4 text-primary" />
                            {service.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell max-w-[300px] truncate">
                          {service.description}
                        </TableCell>

                        <TableCell>
                          ₱{service.price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? 'default' : 'outline'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <Button variant="ghost" className="p-0 w-8 h-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="z-50 p-2 rounded-md border shadow-md bg-popover text-popover-foreground border-border">
                                <div className="mb-1">
                                  <button
                                    type="button"
                                    onClick={() => router.get(`/admin/dental-services/${service.id}/edit`)}
                                    className="flex justify-between items-center px-2 py-2 w-full text-blue-600 rounded transition-colors bg-background dark:bg-popover hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
                                  >
                                    <div className="flex-grow text-sm font-medium text-left">Edit service</div>
                                    <div className="flex items-center">
                                      <Edit className="w-4 h-4" />
                                    </div>
                                  </button>
                                </div>
                                
                                <div className="mb-1">
                                  <button
                                    type="button"
                                    onClick={() => openToggleDialog(service)}
                                    className={`flex justify-between items-center px-2 py-2 w-full rounded transition-colors bg-background dark:bg-popover ${service.is_active ? 'text-gray-600 hover:bg-gray-600' : 'text-emerald-600 hover:bg-emerald-600'} hover:text-white dark:hover:text-white`}
                                  >
                                    <div className="flex-grow text-sm font-medium text-left">
                                      {service.is_active ? 'Set Inactive' : 'Set Active'}
                                    </div>
                                    <div className="flex items-center">
                                      {service.is_active ? (
                                        <ToggleLeft className="w-4 h-4" />
                                      ) : (
                                        <ToggleRight className="w-4 h-4" />
                                      )}
                                    </div>
                                  </button>
                                </div>
                                
                                <div className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() => openDeleteDialog(service)}
                                    className="flex justify-between items-center px-2 py-2 w-full rounded transition-colors bg-background dark:bg-popover text-destructive hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white"
                                  >
                                    <div className="flex-grow text-sm font-medium text-left">Delete service</div>
                                    <div className="flex items-center">
                                      <Trash className="w-4 h-4" />
                                    </div>
                                  </button>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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

      {/* Toggle Status Confirmation Dialog */}
      <Dialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedService?.is_active ? 'Deactivate' : 'Activate'} Service
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {selectedService?.is_active ? 'deactivate' : 'activate'} <span className="font-medium">{selectedService?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button 
                variant={selectedService?.is_active ? "secondary" : "default"}
                onClick={handleToggleStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>{selectedService?.is_active ? 'Deactivate' : 'Activate'}</>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-medium">{selectedService?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={isLoading}>Cancel</Button>
              </DialogClose>
              <Button 
                variant="destructive" 
                onClick={handleDeleteService}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
