import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../../lib/utils';
import Button from '../button/Button';

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  timeIntervals?: number;
  dateFormat?: string;
  timeCaption?: string;
}

const CustomInput = React.forwardRef<HTMLButtonElement, any>(
  ({ value, onClick, placeholder, disabled, className }) => (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left font-normal",
        !value && "text-muted-foreground",
        className
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value || placeholder || 'Select date and time'}
    </Button>
  )
);

CustomInput.displayName = 'CustomInput';

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  selected,
  onChange,
  placeholder = 'Select date and time',
  className,
  disabled = false,
  minDate,
  maxDate,
  showTimeSelect = true,
  timeIntervals = 15,
  dateFormat = 'MMMM d, yyyy h:mm aa',
  timeCaption = 'Time',
}) => {
  return (
    <div className={cn("w-full relative", className)}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        showTimeSelect={showTimeSelect}
        timeFormat="HH:mm"
        timeIntervals={timeIntervals}
        timeCaption={timeCaption}
        dateFormat={dateFormat}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        customInput={
          <CustomInput 
            placeholder={placeholder}
            disabled={disabled}
          />
        }
        placeholderText={placeholder}
        wrapperClassName="w-full"
        className="w-full"
        calendarClassName="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
        timeClassName={() => 'bg-white dark:bg-gray-800'}
        popperClassName="react-datepicker-popper z-[9999]"
        popperModifiers={[
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
              altAxis: true,
              padding: 5,
              tether: false,
            },
          },
        ] as any}
        popperPlacement="bottom-start"
      />
    </div>
  );
};

export default DateTimePicker;
