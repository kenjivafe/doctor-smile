import { useState, useEffect, useCallback } from 'react';
import { format, addMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';

interface DateTimeSelectionProps {
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

export function DateTimeSelection({
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  dateError,
  timeError,
  serviceDuration,
  dentistId,
  serviceId,
}: DateTimeSelectionProps) {
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

    // Default slots structure
    const slots: TimeSlot[] = [];

    // Morning slots (9AM - 12PM)
    for (let hour = 9; hour < 12; hour++) {
      for (const minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = format(new Date(`1970-01-01T${time}:00`), 'h:mm a');
        slots.push({ time, displayTime, available: true });
      }
    }

    // Afternoon slots (1PM - 5PM)
    for (let hour = 13; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = format(new Date(`1970-01-01T${time}:00`), 'h:mm a');
        slots.push({ time, displayTime, available: true });
      }
    }

    try {
      // Use the dentistId and serviceId props passed from the parent component
      if (!dentistId || !serviceId) {
        console.warn('Missing dentistId or serviceId props');
        return slots; // Return all slots as available if we don't have dentist/service info
      }
      
      // Format date for API request (YYYY-MM-DD)
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      console.log(`Fetching time slots from API: /api/time-slots?dentist_id=${dentistId}&service_id=${serviceId}&date=${formattedDate}`);
      
      // Call the API to get available time slots
      const response = await fetch(`/api/time-slots?dentist_id=${dentistId}&service_id=${serviceId}&date=${formattedDate}`);
      
      if (!response.ok) {
        console.error(`API returned status ${response.status}: ${response.statusText}`);
        throw new Error('Failed to fetch time slots');
      }
      
      const data = await response.json();
      console.log('Full API response:', data);
      
      // If API returns empty array or no timeSlots, return all slots as available
      if (!data.timeSlots || !Array.isArray(data.timeSlots) || data.timeSlots.length === 0) {
        console.log('API returned no time slots, using default slots (all available)');
        return slots;
      }
      
      console.log('API returned time slots:', data.timeSlots);
      
      // Create a map of time -> availability from API response
      const availabilityMap = new Map();
      data.timeSlots.forEach((slot: { time: string; available: boolean }) => {
        console.log(`API slot: ${slot.time}, available: ${slot.available}`);
        availabilityMap.set(slot.time, slot.available);
      });
      
      // Update our slots with availability from API
      const updatedSlots = slots.map(slot => {
        // If we have availability info from API, use it
        if (availabilityMap.has(slot.time)) {
          const isAvailable = availabilityMap.get(slot.time);
          console.log(`Setting slot ${slot.time} (${slot.displayTime}) to ${isAvailable ? 'available' : 'unavailable'}`);
          return {
            ...slot,
            available: isAvailable
          };
        }
        // If the API doesn't have info for this slot, assume it's available
        console.log(`No API info for slot ${slot.time} (${slot.displayTime}), assuming available`);
        return {
          ...slot,
          available: true
        };
      });
      
      console.log('Final processed slots:', updatedSlots);
      return updatedSlots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      // In case of error, return all slots as available for better user experience
      return slots;
    }
  }, [dentistId, serviceId]);

  // Update time slots when date changes
  useEffect(() => {
    if (selectedDateObj) {
      setIsLoading(true);

      // Function to check if a time slot would be unavailable due to service duration
      const isSlotUnavailableDueToServiceDuration = (slot: TimeSlot, selectedSlotTime: string): boolean => {
        if (!selectedSlotTime || !serviceDuration || serviceDuration <= 30) {
          return false;
        }

        // Convert times to Date objects for comparison
        const slotDate = new Date(`1970-01-01T${slot.time}:00`);
        const selectedTimeDate = new Date(`1970-01-01T${selectedSlotTime}:00`);
        
        // Calculate end time of the appointment based on service duration
        const appointmentEndTime = addMinutes(selectedTimeDate, serviceDuration);
        
        // Check if this slot falls within the appointment duration
        // (but is not the starting slot itself)
        return slot.time !== selectedSlotTime && 
               slotDate > selectedTimeDate && 
               slotDate < appointmentEndTime;
      };

      // Fetch time slots from API
      const fetchTimeSlots = async () => {
        try {
          console.log('Fetching time slots for date:', format(selectedDateObj, 'yyyy-MM-dd'));
          console.log('Using dentistId:', dentistId, 'and serviceId:', serviceId);
          
          const slots = await getFixedTimeSlots(selectedDateObj);
          console.log('Fetched slots before processing:', slots);
          
          // Apply service duration to show which slots would be unavailable
          if (selectedTime) {
            const processedSlots = slots.map(slot => {
              // If this slot would be blocked by the selected appointment due to service duration
              if (isSlotUnavailableDueToServiceDuration(slot, selectedTime)) {
                return { ...slot, available: false };
              }
              return slot;
            });
            console.log('Setting available time slots with service duration applied:', processedSlots);
            setAvailableTimeSlots(processedSlots);
          } else {
            console.log('Setting available time slots without service duration:', slots);
            setAvailableTimeSlots(slots);
          }
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
    console.log('Selected time:', time);
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
      <div>
        <h2 className="mb-2 text-xl font-semibold">Select Date & Time</h2>
        <p className="mb-4 text-muted-foreground">
          Choose a convenient date and time for your appointment
        </p>
      </div>

      <div className="flex gap-4 h-auto">
        <div>
          <h3 className="flex items-center mb-2 text-base font-medium">
            <CalendarIcon className="mr-2 w-4 h-4" />
            Select Date
          </h3>
          {dateError && (
            <div className="mb-2 text-sm font-medium text-destructive">
              {dateError}
            </div>
          )}
          <Calendar
            mode="single"
            selected={selectedDateObj}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            className="rounded-md border shadow"
          />
        </div>

        <div className="w-full">
          <h3 className="flex items-center mb-2 text-base font-medium">
            <Clock className="mr-2 w-4 h-4" />
            Select Time
          </h3>
          <Card className="flex flex-col p-4 rounded-md border shadow">
            {selectedDateObj ? (
              <div className="grid overflow-y-auto flex-grow grid-cols-2 gap-2 sm:grid-cols-3">
                {isLoading ? (
                  <div className="flex col-span-full justify-center items-center py-4 h-full text-center text-muted-foreground">
                    Loading available time slots...
                  </div>
                ) : (
                  availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => {
                    console.log(`Rendering slot ${slot.time}: available=${slot.available}`);
                    return (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={!slot.available ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}
                      >
                        {!slot.available ? (
                          <span className="line-through text-muted-foreground font-bold">
                            <s>{slot.displayTime}</s>
                          </span>
                        ) : (
                          slot.displayTime
                        )}
                      </Button>
                    );
                  })
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
