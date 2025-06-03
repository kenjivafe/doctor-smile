import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Link, router } from "@inertiajs/react";
import {
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  AlertCircle
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the appointment type
interface Appointment {
  id: number;
  patient_name: string;
  patient_id: number;
  dentist_name: string;
  dentist_id: number;
  service_name: string;
  service_id: number;
  appointment_datetime: string;
  status: string;
  duration_minutes: number;
  cost: number;
  payment_status?: 'paid' | 'unpaid';
  notes?: string;
  cancellation_reason?: string;
}

interface AppointmentsTableProps {
  data: Appointment[];
  itemsPerPage?: number;
}

// Export the AppointmentsTable component
export function AppointmentsTable({ data, itemsPerPage = 10 }: AppointmentsTableProps) {
  // State for cancellation dialog
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle cancel appointment
  const handleCancelAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingAppointment || !cancellationReason.trim()) return;
    
    setIsSubmitting(true);
    
    router.post(`/admin/appointments/${cancellingAppointment.id}/cancel`, {
      cancellation_reason: cancellationReason,
    }, {
      onSuccess: () => {
        setCancellingAppointment(null);
        setCancellationReason('');
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
      preserveScroll: true,
    });
  };

  // State for sorting
  const [sortField, setSortField] = useState<keyof Appointment>('appointment_datetime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort change
  const handleSort = (field: keyof Appointment) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(Math.ceil(data.length / itemsPerPage));
  }, [data, itemsPerPage]);

  // Sort the data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const field = sortField as keyof Appointment;
      if (field === 'appointment_datetime') {
        const dateA = new Date(a[field]);
        const dateB = new Date(b[field]);
        return sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      } else {
        const valueA = String(a[field] || '').toLowerCase();
        const valueB = String(b[field] || '').toLowerCase();
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  }, [data, sortField, sortDirection]);

  // Function to get the appropriate badge variant based on appointment status
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'outline';
    }
  };

  // Function to format the status text for display
  const formatStatus = (status: string): string => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Get current page data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('patient_name')} className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center space-x-1">
                <span>Patient</span>
                {sortField === 'patient_name' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                ) : (
                  <ArrowUpDown className="w-4 h-4 opacity-50" />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('dentist_name')} className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center space-x-1">
                <span>Dentist</span>
                {sortField === 'dentist_name' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                ) : (
                  <ArrowUpDown className="w-4 h-4 opacity-50" />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('service_name')} className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center space-x-1">
                <span>Service</span>
                {sortField === 'service_name' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                ) : (
                  <ArrowUpDown className="w-4 h-4 opacity-50" />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('appointment_datetime')} className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center space-x-1">
                <span>Date & Time</span>
                {sortField === 'appointment_datetime' ? (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                ) : (
                  <ArrowUpDown className="w-4 h-4 opacity-50" />
                )}
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:bg-muted/50">
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {sortField === 'status' ? (
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
          {currentItems.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell className="font-medium">{appointment.patient_name}</TableCell>
              <TableCell>{appointment.dentist_name}</TableCell>
              <TableCell>{appointment.service_name}</TableCell>
              <TableCell>
                {format(new Date(appointment.appointment_datetime), 'PPP')}
                <div className="text-xs text-muted-foreground">
                  {format(new Date(appointment.appointment_datetime), 'p')} · {appointment.duration_minutes} mins
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(appointment.status)}>
                  {formatStatus(appointment.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex justify-center items-center p-0 w-8 h-8 rounded-md cursor-pointer hover:bg-accent hover:text-background">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-2 rounded-md border shadow-md bg-popover text-popover-foreground border-border">
                      <div className="mb-1">
                        <Link
                          href={`/admin/appointments/${appointment.id}`}
                          className="flex justify-between items-center px-2 py-2 w-full text-blue-600 rounded transition-colors bg-background dark:bg-popover hover:bg-primary hover:text-primary-foreground dark:hover:bg-blue-600 dark:hover:text-white"
                        >
                          <div className="flex-grow text-sm font-medium text-left">View details</div>
                        </Link>
                      </div>
                      {['pending', 'confirmed'].includes(appointment.status) && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => setCancellingAppointment(appointment)}
                            className="flex justify-between items-center px-2 py-2 w-full text-red-600 rounded transition-colors bg-background dark:bg-popover hover:bg-destructive hover:text-destructive-foreground dark:hover:bg-red-600 dark:hover:text-white"
                          >
                            <div className="flex-grow text-sm font-medium text-left">Cancel appointment</div>
                          </button>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 border-t">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-700'}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, data.length)}</span> of{' '}
                <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div>
              <nav className="inline-flex relative z-0 -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-500'}`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show limited page numbers for better UI
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNumber ? 'z-10 bg-primary text-white border-primary' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <span
                        key={pageNumber}
                        className="inline-flex relative items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-500'}`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronUp className="w-5 h-5 rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Dialog */}
      <Dialog open={!!cancellingAppointment} onOpenChange={(open) => !open && setCancellingAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCancelAppointment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationReason">Reason for cancellation</Label>
              <Textarea
                id="cancellationReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>This action will notify the patient about the cancellation.</span>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCancellingAppointment(null)}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={!cancellationReason.trim() || isSubmitting}
              >
                {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
