import React, { useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Animated number component
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

const AnimatedNumber = ({ value, duration = 1.5, className = '' }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = Math.max(0, value); // Ensure we don't have negative values
    const incrementTime = end > 0 ? (duration * 1000) / end : 0;
    
    if (end === 0) {
      setDisplayValue(0);
      return;
    }
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(Math.min(start, end));
      
      if (start >= end) {
        clearInterval(timer);
      }
    }, incrementTime);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span className={className}>{displayValue.toLocaleString()}</span>;
};

// StatCard component for displaying individual statistics with animation
interface StatCardProps {
  title: string;
  value?: number | string;
  description?: string;
  bgColor: string;
  duration?: number;
  delay?: number;
  className?: string;
  buttonIcon?: React.ReactNode;
  onButtonClick?: () => void;
  showButton?: boolean;
}

const StatCard = ({ 
  title, 
  value = 0, 
  description,
  bgColor, 
  duration = 1.5, 
  delay = 0.1,
  className = '',
  buttonIcon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  onButtonClick,
  showButton = false
}: StatCardProps) => {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col overflow-hidden rounded-lg p-5 h-full ${bgColor} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 20
      }}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: "easeOut"
      }}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
              {showButton && onButtonClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onButtonClick();
                  }}
                  className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2.5 -m-1.5 w-10 h-10 border border-gray-200 dark:border-gray-600 transition-colors"
                  aria-label="View details"
                >
                  {buttonIcon}
                </button>
              )}
            </div>
            <AnimatedNumber 
              value={typeof value === 'number' ? value : 0} 
              duration={duration} 
              className="text-2xl font-semibold text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  )
};

export default StatCard;
