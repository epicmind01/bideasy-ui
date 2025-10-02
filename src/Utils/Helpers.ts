export const LOCAL_STORAGE_KEYS = {
    TOKEN: 'token',
    USER_TYPE: 'userType',
    USER: 'user',
    USER_ID: 'userId',
    USER_NAME: 'username',
    USER_CODE: 'userCode',
    IS_AUTHENTICATED: 'isAuth',
    PERMISSIONS: 'permissions',
  };
  

export const setLocalItem = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };
  
  export const getLocalItem = (key: string): any => {
  const value = localStorage.getItem(key);
  if (value === null) return null;
  
  try {
    // Try to parse as JSON, but return as-is if it's not valid JSON (like JWT tokens)
    return JSON.parse(value);
  } catch (e) {
    // If it's not valid JSON, return the raw string
    return value;
  }
};
  
  export const removeLocalItem = (key: string) => {
    localStorage.removeItem(key);
  };
  
  export const resetLocalStorage = () => {
    removeLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
    removeLocalItem(LOCAL_STORAGE_KEYS.IS_AUTHENTICATED);
    removeLocalItem(LOCAL_STORAGE_KEYS.USER);
    removeLocalItem(LOCAL_STORAGE_KEYS.USER_TYPE);
    removeLocalItem(LOCAL_STORAGE_KEYS.PERMISSIONS);
  };
  // Helper function to check if a user has a specific permission
export const hasPermission = (required: string) => {
  const permissions = getLocalItem(LOCAL_STORAGE_KEYS.PERMISSIONS);
  return permissions?.includes(required);
};

// Helper function to check if a user has any of the required permissions
export const hasAnyPermission = (requiredList: string[]) => {
  const permissions = getLocalItem(LOCAL_STORAGE_KEYS.PERMISSIONS);
  return requiredList.some((perm) => permissions?.includes(perm));
};

/**
 * Formats a number as Indian Rupees (INR)
 * @param amount - The amount to format (can be number or string)
 * @returns Formatted currency string with Indian number format (e.g., "₹ 1,00,000")
 */
import { format, differenceInMilliseconds } from 'date-fns';

export const formatAuctionDate = (dateString: string | Date): string => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy hh:mm a');
  } catch (e) {
    return 'Invalid date';
  }
};

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

export const calculateTimeLeft = (endDate: Date | string): TimeLeft => {
  const end = new Date(endDate);
  const now = new Date();
  
  if (isNaN(end.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const diff = differenceInMilliseconds(end, now);

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
  const minutes = Math.max(0, Math.floor((diff / 1000 / 60) % 60));
  const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

  return { days, hours, minutes, seconds, isEnded: false };
};

export const formatTimeLeft = (timeLeft: TimeLeft): string => {
  if (timeLeft.isEnded) return 'Auction ended';
  
  const { days, hours, minutes, seconds } = timeLeft;
  return `${days > 0 ? `${days}d ` : ''}${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
};

export const formatIndianCurrency = (amount: number | string): string => {
  // Convert string to number if needed
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle invalid numbers
  if (isNaN(num)) return '₹ 0';
  
  // Format the number with Indian locale
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // No decimal places for whole numbers
    currencyDisplay: 'symbol',
  }).format(num).replace('₹', '₹ '); // Add space after ₹ for better readability
};