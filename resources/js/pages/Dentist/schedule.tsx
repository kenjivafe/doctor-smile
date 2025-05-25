import { PageTemplate } from '@/components/page-template';
import { type BreadcrumbItem } from '@/types';
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  // No longer tracking active status separately

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
      <div className="mb-6 w-full">
        <div className="flex mb-4 border-b">
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {workingHours.map((hour) => (
                      <div
                        key={hour.id}
                        className="flex items-center justify-between p-4 border rounded-lg border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-28 font-medium">{hour.day_name}</div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-200" />
                            <span>{formatTime(hour.start_time)} - {formatTime(hour.end_time)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Active toggle removed */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorkingHour(hour.id)}
                            className="dark:hover:bg-white dark:hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No working hours set. Add your regular working hours to let patients know when you're available.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowAddWorkingHourForm(true)}>
                <Plus className="mr-2 w-4 h-4" />
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {blockedDates.map((date) => (
                      <div key={date.id} className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-800 dark:border-red-800">
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {new Date(date.blocked_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {date.is_full_day ? (
                              <span className="inline-block px-2 py-1 text-xs text-red-800 bg-red-100 rounded">Full Day</span>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(date.start_time || '')} - {formatTime(date.end_time || '')}</span>
                              </div>
                            )}
                          </div>
                          {date.reason && (
                            <div className="mt-1 text-sm">
                              <span className="font-medium">Reason:</span> {date.reason}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBlockedDate(date.id)}
                          className="dark:hover:bg-white dark:hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No blocked dates set. Block dates when you're not available for appointments.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setShowAddBlockedDateForm(true)}>
                <Plus className="mr-2 w-4 h-4" />
                Block a Date
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Add Working Hour Form */}
      <Dialog open={showAddWorkingHourForm} onOpenChange={setShowAddWorkingHourForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Working Hours</DialogTitle>
            <DialogDescription>
              Set your regular working hours for a specific day of the week.
            </DialogDescription>
          </DialogHeader>
            <form onSubmit={handleAddWorkingHour} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="day_of_week" className="block text-sm font-medium">
                  Day of Week
                </label>
                <select
                  id="day_of_week"
                  value={workingHourForm.data.day_of_week}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => workingHourForm.setData('day_of_week', e.target.value)}
                  className="p-2 w-full rounded-md border"
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
                <label htmlFor="start_time" className="block text-sm font-medium">
                  Start Time
                </label>
                <input
                  type="time"
                  id="start_time"
                  value={workingHourForm.data.start_time}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => workingHourForm.setData('start_time', e.target.value)}
                  className="p-2 w-full rounded-md border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="end_time" className="block text-sm font-medium">
                  End Time
                </label>
                <input
                  type="time"
                  id="end_time"
                  value={workingHourForm.data.end_time}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => workingHourForm.setData('end_time', e.target.value)}
                  className="p-2 w-full rounded-md border"
                  required
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddWorkingHourForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Hours</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {/* Add Blocked Date Form */}
      <Dialog open={showAddBlockedDateForm} onOpenChange={setShowAddBlockedDateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block a Date</DialogTitle>
            <DialogDescription>
              Block specific dates when you're not available for appointments.
            </DialogDescription>
          </DialogHeader>
            <form onSubmit={handleAddBlockedDate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="blocked_date" className="block text-sm font-medium">
                  Date
                </label>
                <input
                  type="date"
                  id="blocked_date"
                  value={blockedDateForm.data.blocked_date}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => blockedDateForm.setData('blocked_date', e.target.value)}
                  className="p-2 w-full rounded-md border"
                  required
                />
              </div>

              <div className="flex items-center mb-4 space-x-2">
                <input
                  type="checkbox"
                  id="is_full_day"
                  checked={isFullDay}
                  onChange={() => setIsFullDay(!isFullDay)}
                  className="w-4 h-4"
                />
                <label htmlFor="is_full_day" className="text-sm font-medium">
                  Block entire day
                </label>
              </div>

              {!isFullDay && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="start_time_blocked" className="block text-sm font-medium">
                      Start Time
                    </label>
                    <input
                      type="time"
                      id="start_time_blocked"
                      value={blockedDateForm.data.start_time}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => blockedDateForm.setData('start_time', e.target.value)}
                      className="p-2 w-full rounded-md border"
                      required={!isFullDay}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="end_time_blocked" className="block text-sm font-medium">
                      End Time
                    </label>
                    <input
                      type="time"
                      id="end_time_blocked"
                      value={blockedDateForm.data.end_time}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => blockedDateForm.setData('end_time', e.target.value)}
                      className="p-2 w-full rounded-md border"
                      required={!isFullDay}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="reason" className="block text-sm font-medium">
                  Reason (Optional)
                </label>
                <textarea
                  id="reason"
                  value={blockedDateForm.data.reason}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => blockedDateForm.setData('reason', e.target.value)}
                  className="p-2 w-full rounded-md border"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddBlockedDateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Block Date</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </PageTemplate>
  );
}
