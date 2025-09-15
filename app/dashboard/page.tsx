"use client";

import React from "react";
import { useState } from "react";
import ServiceBookingStatusData from "./services/ServiceBookingStatusData";
import ServiceTopCustomer from "./services/ServiceTopCustomer";
import { Suspense, useEffect, useRef } from "react";
import { QuickActions, TopSaleChart } from "./lazy-components";
import { Notification, useNotification } from "@/app/components/notification";
import { usePageStatus } from "@/app/hooks/usePageStatus";
import { useDashboardData } from "@/app/hooks/useDashboardData";
import { ApiService } from "@/app/lib/api-service";
import { useDateRange } from "@/app/contexts/DateContext";

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

  // Use global date context instead of local state
  const { fromDate, toDate, isLoaded: dateLoaded } = useDateRange();

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

  // Show loading if date context is not loaded yet
  if (!dateLoaded) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

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
          <TopSaleChart />
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
