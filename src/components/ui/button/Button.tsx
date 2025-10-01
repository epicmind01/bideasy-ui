import type { ReactNode } from "react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  className = "",
  title = "",
  ...props
}) => {
  // Base button classes
  let buttonClasses = `inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${className}`;

  // Size classes
  if (size === "sm") {
    buttonClasses += " px-3 py-1.5 text-sm";
  } else {
    buttonClasses += " px-4 py-2 text-base";
  }

  // Variant classes
  if (variant === "primary") {
    buttonClasses +=
      " bg-brand-100 text-brand-700 hover:bg-brand-200 dark:bg-brand-600/30 dark:text-white dark:hover:bg-brand-700/40 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed";
  } else {
    buttonClasses +=
      " border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed";
  }

  return (
    <button
      type="button"
      className={buttonClasses}
      title={title}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};

export default Button;
