import React from 'react';

interface PrimaryButtonProps {
  onClick: () => void;
  title: string;
  additionalClasses?: string;
  disable?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  onClick,
  title,
  additionalClasses = '',
  disable = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disable}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${additionalClasses}`}
    >
      {title}
    </button>
  );
};

export default PrimaryButton;
