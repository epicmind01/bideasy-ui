import React from 'react';

interface StatusProps {
  status: string;
  className?: string;
}

const Status: React.FC<StatusProps> = ({ status, className = '' }) => {
  const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100';
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'IN_APPROVAL':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(status)} ${className}`}
    >
      {status}
    </span>
  );
};

export default Status;
