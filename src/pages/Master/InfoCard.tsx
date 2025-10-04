import React from "react";
import { hasPermission } from "../../utils/Helpers";

interface InfoCardProps {
  title: string;
  subtitle?: string;
  count: number;
  icon?: React.ReactNode;
  onClick: () => void;
  accentColor?: string;
  iconBgColor?: string;
  allowPermission:string;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  subtitle,
  count,
  icon,
  onClick,
  allowPermission
}) => {
  
  // Adjust colors for dark mode
  const darkModeIconBg = "rgba(99, 102, 241, 0.2)";
  return (
    <div
    
      className="relative bg-white dark:bg-gray-800 shadow-sm rounded-xl p-5 cursor-pointer hover:shadow-md transition-all border border-gray-200 dark:border-gray-700"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 flex items-center justify-center rounded-md mb-4"
        style={{ backgroundColor: darkModeIconBg }}
      >
        {icon}
      </div>

      {/* Title & Subtitle */}
      <div className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>

      {/* Count left + Accent bar right */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-2xl font-bold text-black dark:text-white">
          {count.toLocaleString()}
        </span>
        {hasPermission(allowPermission)  && (
        <button
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={onClick}
          >
          View List
        </button>
        )}
      </div>
    </div>
  );
};

export default InfoCard;