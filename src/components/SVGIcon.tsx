import React from 'react';

interface SVGIconProps {
  name?: string;
  className?: string;
  size?: number;
  Icon?: React.ComponentType;
}

const SVGIcon: React.FC<SVGIconProps> = ({ className = '', size = 24, Icon }) => {
  // This is a placeholder component for SVG icons
  // In a real application, you would import the actual SVG icons
  if (Icon) {
    return <Icon />;
  }
  
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-gray-500">📄</span>
    </div>
  );
};

export default SVGIcon;
