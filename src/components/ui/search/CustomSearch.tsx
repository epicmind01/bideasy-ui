import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchOption {
  label: string;
  value: string;
}

interface CustomSearchProps {
  options: SearchOption[];
  setFilter: (value: string) => void;
  placeholder: string;
  setSearch: (value: string) => void;
  className?: string;
}

const CustomSearch: React.FC<CustomSearchProps> = ({
  options,
  setFilter,
  placeholder,
  setSearch,
  className = '',
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setSearch(value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedFilter(value);
    setFilter(value);
  };

  const clearSearch = () => {
    setSearchValue('');
    setSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex">
        {options.length > 0 && (
          <select
            value={selectedFilter}
            onChange={handleFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-l-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-10 py-2 border border-gray-300 ${
              options.length > 0 ? 'rounded-r-md' : 'rounded-md'
            } bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomSearch;
