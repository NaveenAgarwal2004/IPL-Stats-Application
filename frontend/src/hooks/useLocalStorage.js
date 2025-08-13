import { useState, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      
      // Ensure the item is not "undefined" or any other invalid value
      if (item && item !== 'undefined') {
        return JSON.parse(item);
      }
      
      return initialValue; // If invalid, return initial value
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // In case of error, return the initial value
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      // Ensure we're storing valid JSON
      if (value !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        console.warn(`Attempted to store invalid value for key "${key}"`);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
};
