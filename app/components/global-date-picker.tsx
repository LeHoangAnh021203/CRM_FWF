"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CalendarDate, today, getLocalTimeZone, parseDate } from '@internationalized/date';
import { useDateRange } from '@/app/contexts/DateContext';
import { Button } from './ui/button';
import { Calendar, ChevronDown, RotateCcw } from 'lucide-react';

interface GlobalDatePickerProps {
  className?: string;
  showResetButton?: boolean;
  compact?: boolean;
}

export function GlobalDatePicker({ 
  className = "", 
  showResetButton = true,
  compact = false 
}: GlobalDatePickerProps) {
  const { startDate, endDate, setStartDate, setEndDate, resetToDefault, isLoaded } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<CalendarDate | null>(null);
  const [tempEndDate, setTempEndDate] = useState<CalendarDate | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize temp dates when dropdown opens
  useEffect(() => {
    if (isOpen && isLoaded) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [isOpen, startDate, endDate, isLoaded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  const formatDate = (date: CalendarDate) => {
    return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
  };

  const formatDateRange = () => {
    if (!isLoaded) return "Đang tải...";
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  if (!isLoaded) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-9 bg-gray-200 rounded-md animate-pulse w-48"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Date Range Display Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${compact ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'}`}
      >
        <Calendar className="w-4 h-4" />
        <span className={compact ? 'text-xs' : 'text-sm'}>
          {formatDateRange()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Reset Button */}
      {showResetButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetToDefault}
          className="ml-2"
          title="Reset về 7 ngày gần nhất"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-96">
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Chọn khoảng thời gian</h3>
              
              {/* Quick Presets */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const todayDate = today(getLocalTimeZone());
                    setTempStartDate(todayDate);
                    setTempEndDate(todayDate);
                  }}
                >
                  Hôm nay
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const todayDate = today(getLocalTimeZone());
                    const yesterdayDate = todayDate.subtract({ days: 1 });
                    setTempStartDate(yesterdayDate);
                    setTempEndDate(yesterdayDate);
                  }}
                >
                  Hôm qua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const todayDate = today(getLocalTimeZone());
                    setTempStartDate(todayDate.subtract({ days: 6 }));
                    setTempEndDate(todayDate);
                  }}
                >
                  7 ngày qua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const todayDate = today(getLocalTimeZone());
                    setTempStartDate(todayDate.subtract({ days: 29 }));
                    setTempEndDate(todayDate);
                  }}
                >
                  30 ngày qua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const todayDate = today(getLocalTimeZone());
                    setTempStartDate(todayDate.subtract({ days: 89 }));
                    setTempEndDate(todayDate);
                  }}
                >
                  90 ngày qua
                </Button>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Từ ngày
                  </label>
                  <input
                    type="date"
                    value={tempStartDate ? `${tempStartDate.year}-${String(tempStartDate.month).padStart(2, "0")}-${String(tempStartDate.day).padStart(2, "0")}` : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        try {
                          const parsed = parseDate(e.target.value);
                          setTempStartDate(parsed);
                        } catch (error) {
                          console.error('Invalid date:', error);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Đến ngày
                  </label>
                  <input
                    type="date"
                    value={tempEndDate ? `${tempEndDate.year}-${String(tempEndDate.month).padStart(2, "0")}-${String(tempEndDate.day).padStart(2, "0")}` : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        try {
                          const parsed = parseDate(e.target.value);
                          setTempEndDate(parsed);
                        } catch (error) {
                          console.error('Invalid date:', error);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!tempStartDate || !tempEndDate}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
