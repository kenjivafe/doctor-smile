declare module "@/components/ui/calendar" {
  import { ComponentProps } from "react";
  import { DayPicker } from "react-day-picker";
  
  export type CalendarProps = ComponentProps<typeof DayPicker>;
  
  export const Calendar: React.FC<CalendarProps>;
}
