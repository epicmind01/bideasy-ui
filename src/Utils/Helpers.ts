const LOCAL_STORAGE_KEYS = {
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
    return value ? JSON.parse(value) : null;
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
  