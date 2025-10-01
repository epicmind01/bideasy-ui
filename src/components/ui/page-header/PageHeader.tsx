import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonText = '',
  backButtonUrl,
  className = '',
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButtonUrl) {
      navigate(backButtonUrl);
    } else {
      navigate(-1); // Go back to the previous page
    }
  };

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100 
                       dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              title={backButtonText || 'Go back'}
              aria-label={backButtonText || 'Go back'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {children && <div className="ml-4">{children}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
