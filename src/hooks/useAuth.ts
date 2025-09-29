"use client";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  const SESSION_DURATION = 1 * 60 * 60 * 1000; // 6 hours in milliseconds
// const SESSION_DURATION = 1 * 60 * 1000;

  const logout = useCallback(() => {
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('loginTime');
    setIsLoggedIn(false);
    navigate('/login');
  }, [navigate]);

  const checkSessionExpiry = useCallback(() => {
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (loggedIn && loginTime) {
      const currentTime = Date.now();
      const timeElapsed = currentTime - parseInt(loginTime);
      
      if (timeElapsed >= SESSION_DURATION) {
        logout();
        return false;
      }
      return true;
    }
    return false;
  }, [logout]);

  useEffect(() => {
    const isValid = checkSessionExpiry();
    setIsLoggedIn(isValid);
    setIsChecking(false);
    
    if (!isValid && window.location.pathname !== '/login') {
      navigate('/login');
    }

    // Set up automatic logout timer
    if (isValid) {
      const loginTime = parseInt(localStorage.getItem('loginTime') || '0');
      const timeElapsed = Date.now() - loginTime;
      const timeRemaining = SESSION_DURATION - timeElapsed;
      
      if (timeRemaining > 0) {
        const timeoutId = setTimeout(() => {
          logout();
        }, timeRemaining);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [checkSessionExpiry, logout]);

  const login = () => {
    const currentTime = Date.now().toString();
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('loginTime', currentTime);
    setIsLoggedIn(true);
    navigate('/');
  };

  return { isLoggedIn, isChecking, login, logout };
}