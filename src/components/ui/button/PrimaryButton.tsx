import React from 'react';

interface PrimaryButtonProps {
  onClick: () => void;
  title: string;
  additionalClasses?: string;
  disable?: boolean;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  title,
  additionalClasses = '',
  disable = false,
  type = 'button',
  isLoading = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disable || isLoading}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${additionalClasses}`}
    >
      {isLoading ? 'Loading...' : title}
    </button>
  );
};

export default PrimaryButton;
