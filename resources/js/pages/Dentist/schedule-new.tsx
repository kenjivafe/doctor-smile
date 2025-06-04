import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import { useState, FormEvent, ChangeEvent } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Trash2, Plus, X } from 'lucide-react';

interface WorkingHour {
  id: number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface BlockedDate {
  id: number;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  is_full_day: boolean;
}

interface ScheduleProps {
  workingHours: WorkingHour[];
  blockedDates: BlockedDate[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Schedule',
    href: '/dentist/schedule',
  },
];

// Day of week mapping
const daysOfWeek = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export default function Schedule({ workingHours = [], blockedDates = [] }: ScheduleProps) {
  const [activeTab, setActiveTab] = useState<'working-hours' | 'blocked-dates'>('working-hours');
  const [showAddWorkingHourForm, setShowAddWorkingHourForm] = useState(false);
  const [showAddBlockedDateForm, setShowAddBlockedDateForm] = useState(false);
  const [isFullDay, setIsFullDay] = useState(true);

  // Form for adding working hours
  const workingHourForm = useForm({
    day_of_week: '',
    start_time: '',
    end_time: '',
  });

  // Form for adding blocked dates
  const blockedDateForm = useForm({
    blocked_date: '',
    start_time: '',
    end_time: '',
    reason: '',
    is_full_day: false,
  });

  const handleAddWorkingHour = (e: FormEvent) => {
    e.preventDefault();
    workingHourForm.post(route('dentist.schedule.store-working-hour'), {
      onSuccess: () => {
        setShowAddWorkingHourForm(false);
        workingHourForm.reset();
      },
    });
  };

  const handleAddBlockedDate = (e: FormEvent) => {
    e.preventDefault();
    
    // Create a FormData object to handle the submission
    const formData = new FormData();
    formData.append('blocked_date', blockedDateForm.data.blocked_date);
    formData.append('start_time', isFullDay ? '' : blockedDateForm.data.start_time);
    formData.append('end_time', isFullDay ? '' : blockedDateForm.data.end_time);
    formData.append('reason', blockedDateForm.data.reason);
    formData.append('is_full_day', isFullDay ? '1' : '0');
    
    // Post the form
    router.post(route('dentist.schedule.store-blocked-date'), formData, {
      onSuccess: () => {
        setShowAddBlockedDateForm(false);
        blockedDateForm.reset();
        setIsFullDay(true);
      },
    });
  };

  const handleDeleteWorkingHour = (id: number) => {
    if (confirm('Are you sure you want to delete this working hour?')) {
      router.delete(route('dentist.schedule.delete-working-hour', id));
    }
  };

  const handleDeleteBlockedDate = (id: number) => {
    if (confirm('Are you sure you want to unblock this date?')) {
      router.delete(route('dentist.schedule.delete-blocked-date', id));
    }
  };

  const toggleWorkingHourStatus = (hour: WorkingHour) => {
    router.put(route('dentist.schedule.update-working-hour', hour.id), {
      ...hour,
      is_active: !hour.is_active,
    });
  };

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <PageTemplate title="My Schedule" breadcrumbs={breadcrumbs}>
      <div className="w-full mb-6">
        <div className="flex border-b mb-4">
          <button 
            onClick={() => setActiveTab('working-hours')} 
            className={`px-4 py-2 ${activeTab === 'working-hours' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          >
            Working Hours
          </button>
          <button 
            onClick={() => setActiveTab('blocked-dates')} 
            className={`px-4 py-2 ${activeTab === 'blocked-dates' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
          >
            Blocked Dates
          </button>
        </div>
        
        {/* Working Hours Tab */}
        {activeTab === 'working-hours' && (
          <Card>
            <CardHeader>
              <CardTitle>Regular Working Hours</CardTitle>
              <CardDescription>
                Set your regular working hours for each day of the week.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workingHours.length > 0 ? (
                  <div className="grid gap-4">
                    {workingHours.map((hour) => (
                      <div 
                        key={hour.id} 
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          hour.is_active ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-70"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="font-medium w-28">{hour.day_name}</div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{formatTime(hour.start_time)} - {formatTime(hour.end_time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`active-${hour.id}`}
                              checked={hour.is_active}
                              onChange={() => toggleWorkingHourStatus(hour)}
                              className="mr-2"
                            />
                            <label htmlFor={`active-${hour.id}`} className="text-sm font-medium">
                              Active
                            </label>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteWorkingHour(hour.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No working hours set. Add your regular working hours to let patients know when you're available.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowAddWorkingHourForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Working Hours
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Blocked Dates Tab */}
        {activeTab === 'blocked-dates' && (
          <Card>
            <CardHeader>
              <CardTitle>Blocked Dates</CardTitle>
              <CardDescription>
                Block specific dates when you're not available for appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {blockedDates.length > 0 ? (
                  <div className="grid gap-4">
                    {blockedDates.map((date) => (
                      <div key={date.id} className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {new Date(date.blocked_date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {date.is_full_day ? (
                              <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Full Day</span>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(date.start_time || '')} - {formatTime(date.end_time || '')}</span>
                              </div>
                            )}
                          </div>
                          {date.reason && (
                            <div className="text-sm mt-1">
                              <span className="font-medium">Reason:</span> {date.reason}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteBlockedDate(date.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No blocked dates set. Block dates when you're not available for appointments.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowAddBlockedDateForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Block a Date
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      {/* Add Working Hour Form */}
      {showAddWorkingHourForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add Working Hours</h3>
              <button 
                onClick={() => setShowAddWorkingHourForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddWorkingHour}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700">
                    Day of Week
                  </label>
                  <select
                    id="day_of_week"
                    value={workingHourForm.data.day_of_week}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => workingHourForm.setData('day_of_week', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a day</option>
                    {daysOfWeek.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="start_time"
                    value={workingHourForm.data.start_time}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => workingHourForm.setData('start_time', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="end_time"
                    value={workingHourForm.data.end_time}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => workingHourForm.setData('end_time', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddWorkingHourForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Hours</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Blocked Date Form */}
      {showAddBlockedDateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Block a Date</h3>
              <button 
                onClick={() => setShowAddBlockedDateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddBlockedDate}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="blocked_date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    id="blocked_date"
                    value={blockedDateForm.data.blocked_date}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => blockedDateForm.setData('blocked_date', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="is_full_day"
                    checked={isFullDay}
                    onChange={() => setIsFullDay(!isFullDay)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_full_day" className="text-sm font-medium text-gray-700">
                    Block entire day
                  </label>
                </div>
                
                {!isFullDay && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="start_time_blocked" className="block text-sm font-medium text-gray-700">
                        Start Time
                      </label>
                      <input
                        type="time"
                        id="start_time_blocked"
                        value={blockedDateForm.data.start_time}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => blockedDateForm.setData('start_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required={!isFullDay}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="end_time_blocked" className="block text-sm font-medium text-gray-700">
                        End Time
                      </label>
                      <input
                        type="time"
                        id="end_time_blocked"
                        value={blockedDateForm.data.end_time}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => blockedDateForm.setData('end_time', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required={!isFullDay}
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                    Reason (Optional)
                  </label>
                  <textarea
                    id="reason"
                    value={blockedDateForm.data.reason}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => blockedDateForm.setData('reason', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddBlockedDateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Block Date</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
