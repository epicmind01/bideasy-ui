import React from 'react';

interface CustomInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  label?: string;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  additionalClasses?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  label,
  setValue,
  additionalClasses = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setValue) {
      setValue(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className} ${additionalClasses}`}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
      />
    </div>
  );
};

export default CustomInput;
