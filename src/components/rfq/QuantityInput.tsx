import React, { useState, useEffect } from 'react';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = React.memo(({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(value.toString());

  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = () => {
    const numValue = parseInt(localValue) || 0;
    onChange(numValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const numValue = parseInt(localValue) || 0;
      onChange(numValue);
      e.currentTarget.blur();
    }
  };

  return (
    <input
      type="number"
      min="0"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      className="w-20 border rounded px-2 py-1 text-sm"
      placeholder="Enter Qty"
    />
  );
});

QuantityInput.displayName = 'QuantityInput';

export default QuantityInput;
