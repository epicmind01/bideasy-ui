import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonUrl?: string;
  className?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs = [],
  showBackButton = false,
  backButtonText = '',
  backButtonUrl,
  className = '',
  children,
  rightContent,
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
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
            {breadcrumbs.map((item: BreadcrumbItem, index: number) => (
              <li key={index} className="inline-flex items-center">
                {index > 0 && (
                  <ChevronRight className="mx-1 h-4 w-4 text-gray-400" />
                )}
                {item.href ? (
                  <Link
                    to={item.href}
                    className={`inline-flex items-center text-sm font-medium ${
                      item.active
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={`text-sm font-medium ${
                      item.active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:bg-gray-100 
                       dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-300 dark:border-gray-600
                       focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              aria-label={backButtonText || 'Go back'}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1">
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
        
        {rightContent && (
          <div className="md:ml-4 flex-shrink-0">
            {rightContent}
          </div>
        )}
        
        {children && (
          <div className="md:ml-4 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
