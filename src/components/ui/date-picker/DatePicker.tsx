import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import Button from '../button/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover/Popover';
import { Calendar } from '../calendar/Calendar';
import Input from '../input';

interface DatePickerProps {
  selected?: Date;
  onSelect: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  showTimeSelect?: boolean;
  timeIntervals?: number;
  timeCaption?: string;
  dateFormat?: string;
  children?: React.ReactNode;
}

export const DatePicker = ({
  selected,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled = false,
  fromDate,
  toDate,
  showTimeSelect = true,
  timeIntervals = 15,
  timeCaption = 'Time',
  dateFormat = 'MMM d, yyyy h:mm aa',
  children,
  ...props
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  // Format time to HH:MM for the time input
  const formatTimeForInput = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const [timeValue, setTimeValue] = React.useState(
    selected ? formatTimeForInput(selected) : formatTimeForInput(new Date())
  );

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeValue(time);
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = selected ? new Date(selected) : new Date();
      newDate.setHours(hours, minutes, 0, 0);
      onSelect(newDate);
    }
  };

  // Update time value when selected date changes
  React.useEffect(() => {
    if (selected) {
      setTimeValue(formatTimeForInput(selected));
    }
  }, [selected]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Create a new date object to avoid reference issues
    const newDate = new Date(date);
    
    // Always apply the current time value if it exists
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      newDate.setHours(hours, minutes, 0, 0);
    } else if (selected) {
      // If no time value but we have a previous date, keep the same time
      newDate.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      setTimeValue(formatTimeForInput(selected));
    } else {
      // Default to current time if no time is set
      const now = new Date();
      newDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
      setTimeValue(formatTimeForInput(now));
    }
    
    onSelect(newDate);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600",
            !selected && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          {...props}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, showTimeSelect ? 'MMM d, yyyy h:mm aa' : 'PPP') : <span>{placeholder}</span>}
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700" align="start">
        <div className="flex flex-col">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            fromDate={fromDate}
            toDate={toDate}
            initialFocus
          />
          {showTimeSelect && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="w-full [&::-webkit-calendar-picker-indicator]:opacity-100"
                  step={timeIntervals * 60}
                />
              </div>
            </div>
          )}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => setOpen(false)}
              disabled={!selected}
            >
              OK
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
