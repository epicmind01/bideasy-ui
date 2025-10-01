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