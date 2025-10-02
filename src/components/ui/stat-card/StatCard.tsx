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
  value: number;
  bgColor: string;
  duration?: number;
  delay?: number;
  className?: string;
}

const StatCard = ({ 
  title, 
  value, 
  bgColor, 
  duration = 1.5, 
  delay = 0.1,
  className = '' 
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
      className={`overflow-hidden rounded-lg p-4 ${bgColor} ${className}`}
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
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <AnimatedNumber 
        value={value} 
        duration={duration} 
        className="text-2xl font-semibold text-gray-900 dark:text-white"
      />
    </motion.div>
  );
};

export default StatCard;
