import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      // Try to parse as JSON, but if it fails and it's a string type, return as-is
      try {
        return JSON.parse(item);
      } catch {
        // If parsing fails and T is string or the item looks like a plain string, return as string
        // This handles cases where tokens are stored as plain strings
        if (typeof initialValue === 'string' || typeof item === 'string') {
          return item as T;
        }
        return initialValue;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // If it's a string, store it as-is (for tokens), otherwise stringify
      if (typeof valueToStore === 'string') {
        window.localStorage.setItem(key, valueToStore);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

