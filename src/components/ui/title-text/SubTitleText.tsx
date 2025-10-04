import React from 'react';

interface SubTitleTextProps {
  children: React.ReactNode;
  className?: string;
}

const SubTitleText: React.FC<SubTitleTextProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-lg font-semibold text-gray-700 ${className}`}>
      {children}
    </h2>
  );
};

export default SubTitleText;
