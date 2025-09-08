"use client";

import React from "react";
import { useState} from "react";
import ServiceBookingStatusData from "./services/ServiceBookingStatusData";
import ServiceTopCustomer from "./services/ServiceTopCustomer";
import { Suspense, useEffect, useRef } from "react";
import { QuickActions, TopSaleChart } from "./lazy-components";
import { Notification, useNotification } from "@/app/components/notification";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import { ApiService } from "@/app/lib/api-service";
import { useLocalStorageState } from "@/app/hooks/useLocalStorageState";
import { today, getLocalTimeZone, CalendarDate } from "@internationalized/date";

export default function Dashboard() {
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();
  const hasShownSuccess = useRef(false);
  const hasShownError = useRef(false);
  const {
    reportPageError,
    reportDataLoadSuccess,
    reportPagePerformance,
    reportDataLoadError,
  } = usePageStatus("dashboard");

  const { loading, error, apiErrors, apiSuccesses } = useDashboardData();

  const API_BASE_URL = "/api/proxy";

  function useApiData<T>(url: string, fromDate: string, toDate: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      setLoading(true);
      setError(null);
  
      // Extract endpoint from full URL - remove /api/proxy prefix
      const endpoint = url
        .replace(API_BASE_URL, "")
        .replace("/api", "")
        .replace(/^\/+/, "");
      console.log("🔍 Debug - Original URL:", url);
      console.log("🔍 Debug - Extracted Endpoint:", endpoint);
  
      ApiService.post(endpoint, { fromDate, toDate })
        .then((data: unknown) => {
          setData(data as T);
          setLoading(false);
        })
        .catch((err: Error) => {
          console.error("🔍 Debug - API Error:", err);
          setError(err.message);
          setLoading(false);
        });
    }, [url, fromDate, toDate]);
  
    return { data, loading, error };
  }

  interface TopCustomerData {
    phoneNumber: string;
    customerName: string;
    bookingCount: number;
  }

  type BookingStatusData = {
    status: string;
    count: number;
  }[];

  const [startDate, setStartDate] =
    useLocalStorageState<CalendarDate>(
      "dashboard-startDate",
      today(getLocalTimeZone()).subtract({ days: 7 })
    );
  const [endDate, setEndDate] =
    useLocalStorageState<CalendarDate>(
      "dashboard-endDate",
      today(getLocalTimeZone())
    );

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

  const {
    data: topCustomerData,
    loading: topCustomerLoading,
    error: topCustomerError,
  } = useApiData<TopCustomerData[]>(
    `${API_BASE_URL}/api/booking/top-customers`,
    fromDate,
    toDate
  );

  const {
    data: bookingStatusData,
    loading: bookingStatusLoading,
    error: bookingStatusError,
  } = useApiData<BookingStatusData>(
    `${API_BASE_URL}/api/booking/booking-status-stats`,
    fromDate,
    toDate
  );

  

  // Monitor API success notifications
  useEffect(() => {
    if (apiSuccesses.length > 0 && !hasShownSuccess.current) {
      const successMessage =
        apiSuccesses.length === 1
          ? apiSuccesses[0]
          : `${apiSuccesses.length} data sources loaded successfully`;

      showSuccess(successMessage);
      hasShownSuccess.current = true;
      reportDataLoadSuccess("dashboard", apiSuccesses.length);
    }
  }, [apiSuccesses, showSuccess, reportDataLoadSuccess]);

  // Monitor API error notifications
  useEffect(() => {
    if (apiErrors.length > 0 && !hasShownError.current) {
      const errorMessage =
        apiErrors.length === 1
          ? apiErrors[0]
          : `${apiErrors.length} data sources failed to load`;

      showError(errorMessage);
      hasShownError.current = true;
      reportDataLoadError("dashboard", errorMessage);
    }
  }, [apiErrors, showError, reportDataLoadError]);

  // Monitor general error
  useEffect(() => {
    if (error && !hasShownError.current) {
      showError(error);
      hasShownError.current = true;
      reportPageError(error);
    }
  }, [error, showError, reportPageError]);

  // Report page performance
  useEffect(() => {
    if (!loading) {
      reportPagePerformance({ loadTime: 2000 });
    }
  }, [loading, reportPagePerformance]);

  return (
    <div className="p-3 sm:p-6">
      {/* Notification Component */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div className="mb-3 sm:mb-6">
        <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-2">
          Dashboard
        </h1>

         {/* Date Range Picker */}
         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Từ ngày:</label>
              <input
                type="date"
                value={startDate ? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}` : ""}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    const [year, month, day] = date.split('-').map(Number);
                    setStartDate(new CalendarDate(year, month, day));
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Đến ngày:</label>
              <input
                type="date"
                value={endDate ? `${endDate.year}-${String(endDate.month).padStart(2, "0")}-${String(endDate.day).padStart(2, "0")}` : ""}
                onChange={(e) => {
                  const date = e.target.value;
                  if (date) {
                    const [year, month, day] = date.split('-').map(Number);
                    setEndDate(new CalendarDate(year, month, day));
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  setStartDate(new CalendarDate(weekAgo.getFullYear(), weekAgo.getMonth() + 1, weekAgo.getDate()));
                  setEndDate(new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()));
                }}
                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                7 ngày qua
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  setStartDate(new CalendarDate(monthAgo.getFullYear(), monthAgo.getMonth() + 1, monthAgo.getDate()));
                  setEndDate(new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()));
                }}
                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                30 ngày qua
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  setStartDate(new CalendarDate(today.getFullYear(), today.getMonth() + 1, 1));
                  setEndDate(new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate()));
                }}
                className="px-3 py-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors"
              >
                Tháng này
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Hiển thị dữ liệu từ {startDate ? `${startDate.day}/${startDate.month}/${startDate.year}` : 'N/A'} đến {endDate ? `${endDate.day}/${endDate.month}/${endDate.year}` : 'N/A'}
          </div>
        </div>
        <p className="text-gray-600 flex flex-wrap items-center gap-[3px] text-sm sm:text-base">
          Welcome back! Here&apos;s what&apos;s happening with{" "}
          <span className="text-orange-500 flex">Face Wash Fox</span> today.
        </p>
      </div>


      <Suspense
        fallback={
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gray-200 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        }
      >

        
        <QuickActions />
      </Suspense>

      {/* Top Sale Chart */}
      <div className="mt-6">
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-48"></div>
              <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
          }
        >
          <TopSaleChart 
            startDate={startDate}
            endDate={endDate}
            fromDate={fromDate}
            toDate={toDate}
          />
        </Suspense>
      </div>

      <div className="flex gap-2">
          {/* Top 10 khách hàng sử dụng dịch vụ */}
          <ServiceTopCustomer
            topCustomerData={topCustomerData}
            loading={topCustomerLoading}
            error={topCustomerError}
          />

          {/* Tỉ lệ trạng thái đặt lịch */}
          <ServiceBookingStatusData
            bookingStatusData={bookingStatusData}
            loading={bookingStatusLoading}
            error={bookingStatusError}
          />
        </div>
    </div>
  );
}
