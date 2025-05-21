"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarProps {
  className?: string;
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
  disabled?: { before?: Date; after?: Date; dayOfWeek?: number[] }[];
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Calendar({
  className,
  selected,
  onSelect,
  disabled = []
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    return selected || new Date();
  });

  React.useEffect(() => {
    if (selected) {
      setCurrentMonth(selected);
    }
  }, [selected]);

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get days from previous month to display
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  // Create previous month days
  const prevMonthDays = [];
  if (firstDayOfMonth > 0) {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevMonthDays.push({
        date: new Date(prevMonthYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
  }
  
  // Create current month days
  const monthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    monthDays.push({
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, new Date()),
      isSelected: selected ? isSameDay(date, selected) : false
    });
  }
  
  // Create next month days to fill remaining grid
  const nextMonthDays = [];
  const totalDaysDisplayed = prevMonthDays.length + monthDays.length;
  const remainingDays = totalDaysDisplayed % 7 === 0 ? 0 : 7 - (totalDaysDisplayed % 7);
  
  if (remainingDays > 0) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        date: new Date(nextMonthYear, nextMonth, i),
        isCurrentMonth: false,
        isNextMonth: true
      });
    }
  }
  
  // Combine all days
  const calendarDays = [...prevMonthDays, ...monthDays, ...nextMonthDays];
  
  // Format month
  const formatMonth = (date: Date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  
  // Check if two dates are the same day
  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  
  // Check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    if (!disabled || disabled.length === 0) return false;
    
    const dayOfWeek = date.getDay();
    
    return disabled.some(rule => {
      if (rule.before && date < rule.before) return true;
      if (rule.after && date > rule.after) return true;
      if (rule.dayOfWeek && rule.dayOfWeek.includes(dayOfWeek)) return true;
      return false;
    });
  };
  
  // Handle selecting a date
  const handleSelectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    if (onSelect) {
      if (selected && isSameDay(selected, date)) {
        // Deselect if clicking the same date
        onSelect(undefined);
      } else {
        onSelect(date);
      }
    }
  };

  return (
    <div className={cn("calendar w-full p-3 bg-card text-card-foreground rounded-md", className)}>
      <div className="header flex items-center justify-between mb-3">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={prevMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="month-year text-sm font-semibold">
          {formatMonth(currentMonth)}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="days grid grid-cols-7 gap-0 mb-2 border-b border-border pb-1">
        {DAYS.map((day, index) => (
          <div key={index} className="day-header text-center text-xs text-muted-foreground font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid grid grid-cols-7 gap-0">
        {calendarDays.map((day, index) => {
          const isDisabled = isDateDisabled(day.date);
          
          return (
            <div
              key={index}
              className={cn(
                "calendar-day flex items-center justify-center h-10",
                !day.isCurrentMonth && "text-muted-foreground opacity-40",
                isDisabled && "text-muted-foreground opacity-30 cursor-not-allowed",
                !isDisabled && "cursor-pointer"
              )}
              onClick={() => !isDisabled && handleSelectDate(day.date)}
            >
              <div
                className={cn(
                  "day-content flex items-center justify-center rounded-full w-9 h-9 text-sm transition-colors",
                  day.isToday && !day.isSelected && "bg-accent text-accent-foreground font-medium",
                  day.isSelected && "bg-primary text-primary-foreground font-medium",
                  !day.isSelected && !day.isToday && !isDisabled && "hover:bg-muted"
                )}
              >
                {day.date.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };
export type { CalendarProps };
