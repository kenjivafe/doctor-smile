import * as React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export function AppointmentsTable({ data, itemsPerPage = 10 }: AppointmentsTableProps) {
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
  const sortedData = [...data].sort((a, b) => {
    if (sortField === 'appointment_datetime') {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    } else {
      const valueA = a[sortField]?.toString().toLowerCase() || '';
      const valueB = b[sortField]?.toString().toLowerCase() || '';
      return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }
  });

  // Function to get the appropriate badge variant based on appointment status
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "warning" => {
    switch (status) {
      case 'confirmed':
        return 'default'; // Primary color
      case 'completed':
        return 'secondary';
      case 'pending':
      case 'suggested':
        return 'warning'; // Warning color for pending and suggested
      case 'cancelled':
        return 'destructive';
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => window.location.href = `/admin/appointments/${appointment.id}`}
                    >
                      View details
                    </DropdownMenuItem>
                    {['pending', 'confirmed'].includes(appointment.status) && (
                      <DropdownMenuItem
                        onClick={() => window.location.href = `/admin/appointments/${appointment.id}/edit`}
                      >
                        Edit appointment
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {['pending', 'confirmed'].includes(appointment.status) && (
                      <DropdownMenuItem
                        onClick={() => window.location.href = `/admin/appointments/${appointment.id}/cancel`}
                        className="text-destructive"
                      >
                        Cancel appointment
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex-1 flex justify-between sm:hidden">
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
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-gray-50 text-gray-500'}`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="h-5 w-5 rotate-90" />
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
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
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
                  <ChevronUp className="h-5 w-5 rotate-90" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
