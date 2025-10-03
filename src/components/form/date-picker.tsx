import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import type { Options } from 'flatpickr/dist/types/options';
import type { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import CalenderIcon from '../../icons/calender-line.svg?react';

type Hook = (selectedDates: Date[], dateStr: string, instance: FlatpickrInstance) => void;
type DateOption = Options['defaultDate'];

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook;
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  className?: string;
};

export default function DatePicker({
  id,
  mode = "single",
  onChange,
  label,
  defaultDate,
  placeholder,
  className = "",
}: PropsType) {
  const flatpickrRef = useRef<FlatpickrInstance | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const options: Options = {
      mode,
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange: onChange as Hook | undefined,
      prevArrow:
        '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
      nextArrow:
        '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l6 5.4z" /></svg>',
    };

    flatpickrRef.current = flatpickr(inputRef.current, options);

    return () => {
      if (flatpickrRef.current) {
        flatpickrRef.current.destroy();
        flatpickrRef.current = null;
      }
    };
  }, [id, mode, onChange, defaultDate]);

  return (
    <div className={`w-full ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          className={`form-input w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm+ font-medium text-slate-700 placeholder-slate-400 transition-all duration-200 placeholder:text-sm hover:border-slate-400 focus:border-primary dark:border-navy-450 dark:bg-navy-700 dark:text-navy-100 dark:placeholder-navy-300 dark:hover:border-navy-400 dark:focus:border-accent ${className}`}
          placeholder={placeholder}
          type="text"
          data-class="flatpickr-right"
        />
        <div className="pointer-events-none absolute right-0 top-0 flex h-full w-8 items-center justify-center text-slate-400 peer-focus:text-primary dark:text-navy-300 dark:peer-focus:text-accent">
          <CalenderIcon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
