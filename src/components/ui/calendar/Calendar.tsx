import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { cn } from '../../../lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 bg-white dark:bg-gray-800 rounded-md shadow', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium text-gray-900 dark:text-white',
        nav: 'space-x-1 flex items-center',
        nav_button: 'h-7 w-7 bg-white dark:bg-gray-800 p-0 opacity-50 hover:opacity-100 rounded-md border border-gray-300 dark:border-gray-600',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 dark:[&:has([aria-selected])]:bg-gray-700 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'text-gray-900 dark:text-white'
        ),
        day_selected: 'bg-brand-500 text-white hover:bg-brand-600 focus:bg-brand-600',
        day_today: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white',
        day_range_middle: 'aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700 text-gray-900 dark:text-white',
        day_hidden: 'invisible',
        ...classNames,
      }}
      // Using default navigation buttons with custom styling
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
