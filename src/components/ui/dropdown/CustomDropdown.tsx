import React from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownOption {
  id: string;
  name: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  label?: string;
  placeholder: string;
  additionalClasses?: string;
  value: string;
  setValue: (value: string) => void;
  multiple?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  label,
  placeholder,
  additionalClasses = '',
  value,
  setValue,
  multiple: _multiple = false,
}) => {
  return (
    <div className={`relative ${additionalClasses}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;
