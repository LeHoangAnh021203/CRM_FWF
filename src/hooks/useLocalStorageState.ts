import { useState } from 'react';
import { parseDate } from '@internationalized/date';

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Xử lý đặc biệt cho CalendarDate
        if (key.includes('Date') && parsed.year && parsed.month && parsed.day) {
          return parseDate(`${parsed.year}-${String(parsed.month).padStart(2, "0")}-${String(parsed.day).padStart(2, "0")}`);
        }
        return parsed;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(state) : value;
      setState(newValue);
      if (typeof window !== 'undefined') {
        // Xử lý đặc biệt cho CalendarDate
        if (key.includes('Date') && typeof newValue === 'object' && newValue !== null && 'year' in newValue) {
          const dateValue = newValue as unknown as { year: number; month: number; day: number };
          window.localStorage.setItem(key, JSON.stringify({
            year: dateValue.year,
            month: dateValue.month,
            day: dateValue.day
          }));
        } else {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [state, setValue];
}

// Utility function để clear multiple localStorage keys
export function clearLocalStorageKeys(keys: string[]) {
  if (typeof window !== 'undefined') {
    keys.forEach(key => window.localStorage.removeItem(key));
  }
} 