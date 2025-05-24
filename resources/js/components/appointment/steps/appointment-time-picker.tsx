import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';

interface AppointmentTimePickerProps {
  selectedDate?: string;
  selectedTime?: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  dateError?: string;
  timeError?: string;
  serviceDuration?: number;
  dentistId?: number;
  serviceId?: number;
}

interface TimeSlot {
  time: string;       // 24-hour format for backend (H:i)
  displayTime: string; // 12-hour format for display (h:i A)
  available: boolean;
}

export function AppointmentTimePicker({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  dateError,
  timeError,
  serviceDuration,
  dentistId,
  serviceId,
}: AppointmentTimePickerProps) {
  const [selectedDateObj, setSelectedDateObj] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Generate time slots and check availability from the API
  const getFixedTimeSlots = useCallback(async (date: Date): Promise<TimeSlot[]> => {
    // Don't generate slots if the day is Sunday (0)
    const day = date.getDay();
    if (day === 0) {
      return [];
    }
    
    try {
      // Use the dentistId and serviceId props passed from the parent component
      if (!dentistId || !serviceId) {
        console.warn('Missing dentistId or serviceId props');
        return []; // Return empty slots if we don't have dentist/service info
      }
      
      // Format date for API request (YYYY-MM-DD)
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Call the API to get available time slots based on dentist working hours
      // Use the designated API endpoint for time slots
      const endpoint = `/api/time-slots?dentist_id=${dentistId}&service_id=${serviceId}&date=${formattedDate}`;
      
      console.log('Fetching available slots from:', endpoint);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        console.error(`API returned status ${response.status}: ${response.statusText}`);
        throw new Error('Failed to fetch time slots');
      }
      
      const data = await response.json();
      console.log('Available slots data:', data);
      
      // If API returns empty array or no timeSlots, return empty array
      if (!data.timeSlots || !Array.isArray(data.timeSlots)) {
        return [];
      }
      
      // Convert API response to our TimeSlot format
      return data.timeSlots.map((apiSlot: { time: string; available: boolean }) => {
        const displayTime = format(new Date(`1970-01-01T${apiSlot.time}:00`), 'h:mm a');
        return {
          time: apiSlot.time,
          displayTime,
          available: apiSlot.available
        };
      });
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
  }, [dentistId, serviceId]);

  // Update time slots when date changes
  useEffect(() => {
    if (selectedDateObj) {
      setIsLoading(true);

      // Fetch time slots from API
      const fetchTimeSlots = async () => {
        try {
          // Make sure we have the required parameters
          if (!dentistId || !serviceId) {
            console.warn('Missing dentistId or serviceId, cannot fetch time slots');
            setAvailableTimeSlots([]);
            setIsLoading(false);
            return;
          }
          
          const slots = await getFixedTimeSlots(selectedDateObj);
          setAvailableTimeSlots(slots);
        } catch (error) {
          console.error('Error loading time slots:', error);
          setAvailableTimeSlots([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      // Add a short delay to show loading state
      const timer = setTimeout(() => {
        fetchTimeSlots();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedDateObj, selectedTime, serviceDuration, dentistId, serviceId, getFixedTimeSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDateObj(date);
    if (date) {
      onSelectDate(format(date, 'yyyy-MM-dd'));
      onSelectTime(''); // Reset time when date changes
    }
  };

  const handleTimeSelect = (time: string) => {
    onSelectTime(time);
  };

  const disabledDays = [
    { before: new Date() }, // Can't select days in the past
    { dayOfWeek: [0] }, // Disable Sundays
  ];

  return (
    <div className="space-y-4">
      {timeError && (
        <div className="p-3 mt-4 text-sm font-medium text-white rounded-md shadow bg-destructive">
          {timeError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <h3 className="flex items-center mb-2 text-base font-medium">
            <CalendarIcon className="mr-2 w-4 h-4" />
            Select Date
          </h3>
          {dateError && (
            <div className="mb-2 text-sm text-destructive">{dateError}</div>
          )}
          <div className="max-w-full overflow-hidden mx-auto rounded-md border border-border shadow-sm h-[330px] flex items-center justify-center">
            <Calendar
              selected={selectedDateObj}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              className="w-full h-full"
              mode="single"
            />
          </div>
        </div>

        <div className="w-full">
          <h3 className="flex items-center mb-2 text-base font-medium">
            <Clock className="mr-2 w-4 h-4" />
            Select Time
          </h3>
          <Card className="flex flex-col p-4 rounded-md border shadow md:h-[330px] h-auto">
            {selectedDateObj ? (
              <div className="grid overflow-y-auto flex-grow grid-cols-2 gap-3 sm:grid-cols-3 h-full">
                {isLoading ? (
                  <div className="flex col-span-full justify-center items-center py-4 h-full text-center text-muted-foreground">
                    Loading available time slots...
                  </div>
                ) : (
                  availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`${!slot.available ? "opacity-50 cursor-not-allowed bg-gray-100" : ""} 
                        hover:bg-primary hover:text-primary-foreground transition-colors 
                        h-12 flex items-center justify-center`}
                      >
                        {!slot.available ? (
                          <span className="line-through text-muted-foreground font-bold">
                            <s>{slot.displayTime}</s>
                          </span>
                        ) : (
                          slot.displayTime
                        )}
                      </Button>
                    ))
                  ) : (
                    <div className="flex col-span-full justify-center items-center py-4 h-full text-center text-muted-foreground">
                      No available time slots for this day
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex justify-center items-center py-4 h-full text-center text-muted-foreground">
                Please select a date first
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
