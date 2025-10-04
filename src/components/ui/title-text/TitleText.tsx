import React from 'react';

interface TitleTextProps {
  children: React.ReactNode;
  className?: string;
}

const TitleText: React.FC<TitleTextProps> = ({ children, className = '' }) => {
  return (
    <h1 className={`text-2xl font-bold text-gray-900 ${className}`}>
      {children}
    </h1>
  );
};

export default TitleText;
