import React from 'react';

interface SecondaryButtonProps {
  onClick: () => void;
  title: string;
  additionalClasses?: string;
  disable?: boolean;
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: React.ReactNode;
  variant?: string;
  customVariant?: {
    borderColor: string;
    textColor: string;
    hoverColor: string;
    bgColor: string;
  };
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  onClick,
  title,
  additionalClasses = '',
  disable = false,
  type = 'button',
  leftIcon,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disable}
      className={`px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${additionalClasses}`}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {title}
    </button>
  );
};

export default SecondaryButton;
