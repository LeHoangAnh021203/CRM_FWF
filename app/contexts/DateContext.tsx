"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { CalendarDate, today, getLocalTimeZone } from '@internationalized/date';
import { useLocalStorageState } from '@/app/hooks/useLocalStorageState';

interface DateContextType {
  startDate: CalendarDate;
  endDate: CalendarDate;
  setStartDate: (date: CalendarDate) => void;
  setEndDate: (date: CalendarDate) => void;
  resetToDefault: () => void;
  // Formatted dates for API calls
  fromDate: string;
  toDate: string;
  // Loading state
  isLoaded: boolean;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

interface DateProviderProps {
  children: ReactNode;
  defaultStartDate?: CalendarDate;
  defaultEndDate?: CalendarDate;
  storageKey?: string;
}

export function DateProvider({ 
  children, 
  defaultStartDate = today(getLocalTimeZone()).subtract({ days: 7 }),
  defaultEndDate = today(getLocalTimeZone()),
  storageKey = 'global-date-range'
}: DateProviderProps) {
  const [startDate, setStartDate, startDateLoaded] = useLocalStorageState<CalendarDate>(
    `${storageKey}-startDate`,
    defaultStartDate
  );
  const [endDate, setEndDate, endDateLoaded] = useLocalStorageState<CalendarDate>(
    `${storageKey}-endDate`,
    defaultEndDate
  );

  const isLoaded = startDateLoaded && endDateLoaded;

  // Format dates for API calls
  const fromDate = startDate
    ? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(
        startDate.day
      ).padStart(2, "0")}T00:00:00`
    : "";
  const toDate = endDate
    ? `${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(
        endDate.day
      ).padStart(2, "0")}T23:59:59`
    : "";

  const resetToDefault = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
  };

  const value: DateContextType = {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    resetToDefault,
    fromDate,
    toDate,
    isLoaded,
  };

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
}

export function useDateRange() {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDateRange must be used within a DateProvider');
  }
  return context;
}
